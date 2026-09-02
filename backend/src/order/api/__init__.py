import datetime
import decimal
from uuid import UUID

from django.conf import settings
from django.db import transaction
from django.db.models import Exists, OuterRef, Prefetch, Q
from django.utils import timezone, translation
from django.utils.translation import gettext_lazy as _
from djmoney.contrib.exchange.models import convert_money
from djmoney.money import Money
from rest_framework.exceptions import ValidationError

import activity.api.course
import event.api.registration
import membership.api
import notify.tasks
import payment.api.payment_provider
from activity.models import ProgramCourseRegistration
from comunicat.consts import ZERO_MONEY
from comunicat.enums import Module
from data.models import Country, Region
from event.models import Registration
from membership.models import MembershipModule
from notify.enums import EmailType
from order.consts import (
    ORDER_CLEAN_STATUS_CREATED_HOURS,
    ORDER_CLEAN_STATUS_PROCESSING_HOURS,
)
from order.enums import OrderDeliveryType, OrderStatus, OrderType
from order.models import (
    DeliveryProvider,
    Order,
    OrderCourse,
    OrderDelivery,
    OrderDeliveryAddress,
    OrderLog,
    OrderMembership,
    OrderProduct,
    OrderRegistration,
)
from order.utils.delivery import get_delivery_price
from payment.consts import PAYMENT_CODE_REQUIRE_SOURCE
from payment.enums import PaymentStatus
from payment.models import Entity, PaymentOrder
from product.models import ProductSize
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User


def get_list(
    module: Module | None = None,
    user_id: UUID | None = None,
    order_id: UUID | None = None,
    filter_types: list[OrderType] | None = None,
    for_admin: bool = False,
) -> list[Order]:
    order_filter = Q()
    order_annotate = {}

    if order_id:
        order_filter = Q(id=order_id)

    if filter_types:
        order_filter &= Q(type__in=filter_types)

    if user_id:
        order_annotate = {
            "is_user_related": (
                Exists(
                    FamilyMember.objects.filter(
                        status=FamilyMemberStatus.ACTIVE,
                        user_id=user_id,
                        family__members__user_id=OuterRef("entity__user_id"),
                    )
                )
                if settings.MODULE_ALL_FAMILY_SHARE_PAYMENTS
                else Exists(
                    FamilyMember.objects.filter(
                        status=FamilyMemberStatus.ACTIVE,
                        user_id=user_id,
                        family__membership_users__membership__modules__payment_lines__payment_id=OuterRef(
                            "id"
                        ),
                    )
                )
            )
        }
        order_filter &= Q(entity__user_id=user_id) | Q(is_user_related=True)
    else:
        if not order_id and not for_admin:
            return []

    return list(
        Order.objects.annotate(**order_annotate)
        .filter(order_filter)
        .exclude(status__in=(OrderStatus.CANCELLED, OrderStatus.ABANDONED))
        # .annotate(
        #     date=Case(
        #         When(transaction__isnull=False, then=F("transaction__date_accounting")),
        #         output_field=DateField(),
        #         # Warning: Potentially incorrect depending on the timezone
        #         default=F("created_at__date"),
        #     )
        # )
        .select_related(
            "entity",
            "delivery",
            "delivery__provider",
            "delivery__address",
            "delivery__address__country",
            "delivery__address__region",
            "payment_order",
            "payment_order__provider",
        )
        .prefetch_related(
            Prefetch(
                "products",
                OrderProduct.objects.select_related("size", "size__product", "line")
                .prefetch_related(
                    "size__product__sizes",
                    "size__product__images",
                    "size__product__modules",
                    "size__product__modules__teams",
                    "size__product__modules__exclude_teams",
                )
                .with_name()
                .order_by("amount", "name_locale", "size__size"),
            ),
            Prefetch(
                "registrations",
                OrderRegistration.objects.select_related(
                    "registration",
                    "registration__event",
                    "registration__entity",
                    "registration__entity__user",
                ).order_by(
                    "registration__event__time_from",
                    "amount",
                    "registration__entity__firstname",
                    "registration__entity__lastname",
                ),
            ),
            Prefetch(
                "memberships",
                OrderMembership.objects.select_related(
                    "module",
                    "module__membership",
                ).order_by(
                    "module__module",
                    "amount",
                ),
            ),
            Prefetch(
                "courses",
                OrderCourse.objects.select_related(
                    "registration",
                    "registration__course",
                    "registration__entity",
                    "registration__entity__user",
                ).order_by(
                    "registration__course__date_from",
                    "amount",
                    "registration__entity__firstname",
                    "registration__entity__lastname",
                ),
            ),
            Prefetch("logs", OrderLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .order_by("-created_at")
    )


def get(
    order_id: UUID, user_id: UUID | None = None, module: Module | None = None
) -> Order | None:
    order_objs = get_list(order_id=order_id, user_id=user_id, module=module)

    if not order_objs:
        return None

    return order_objs[0]


@transaction.atomic
def create(  # noqa: C901
    order_type: OrderType,
    module: Module,
    cart_sizes: list[dict] | None = None,
    cart_modules: list[dict] | None = None,
    cart_course_registrations: list[dict] | None = None,
    cart_event_registrations: list[dict] | None = None,
    user_id: UUID | None = None,
    user: dict | None = None,
    delivery: dict | None = None,
    pickup: dict | None = None,
) -> Order | None:
    if user_id:
        user_obj = User.objects.filter(id=user_id).with_has_active_membership().first()
        modules = [
            module
            for module in Module
            if getattr(user_obj, f"membership_{module}", False)
        ]
        entity_obj = Entity.objects.filter(user_id=user_id).first()
        if not entity_obj:
            entity_obj, __ = Entity.objects.update_or_create(
                email=user_obj.email,
                defaults={
                    "firstname": user_obj.firstname,
                    "lastname": user_obj.lastname,
                    "phone": user_obj.phone,
                    "user_id": user_obj.id,
                },
            )
    else:
        modules = []
        entity_obj = Entity.objects.filter(
            Q(email=user["email"]) | Q(phone=user["phone"])
        ).first()
        if entity_obj:
            entity_obj.firstname = user["firstname"]
            entity_obj.lastname = user["lastname"]
            entity_obj.email = user["email"]
            entity_obj.phone = user["phone"]
            # This could fail if/when the email field is unique
            entity_obj.save(update_fields=("firstname", "lastname", "email", "phone"))
        else:
            # Maybe link the user if the entity exists?
            entity_obj = Entity.objects.create(
                firstname=user["firstname"],
                lastname=user["lastname"],
                email=user["email"],
                phone=user["phone"],
            )

    order_delivery_obj = None
    product_size_obj_by_id = {}
    membership_module_obj_by_id = {}
    program_course_registration_by_id = {}
    registration_obj_by_id = {}

    if order_type == OrderType.PRODUCT:
        delivery_provider_obj = DeliveryProvider.objects.get(
            id=delivery["provider"]["id"]
        )

        if delivery_provider_obj.type == OrderDeliveryType.DELIVERY:
            country_obj = Country.objects.get(code=delivery["address"].pop("country"))
            if "region" in delivery["address"]:
                region_obj = Region.objects.get(
                    country_id=country_obj.id, code=delivery["address"].pop("region")
                )
            else:
                region_obj = None
            order_delivery_address_obj = OrderDeliveryAddress.objects.create(
                **delivery["address"], country=country_obj, region=region_obj
            )
        else:
            order_delivery_address_obj = None

        if delivery_provider_obj.type == OrderDeliveryType.PICK_UP:
            event_id = pickup["event_id"]
        else:
            event_id = None

        product_size_obj_by_id = {
            product_size_obj.id: product_size_obj
            for product_size_obj in ProductSize.objects.filter(
                id__in=[size["id"] for size in cart_sizes]
            )
            .select_related("product")
            .with_price(modules=modules)
            .with_stock()
        }

        delivery_price_obj = None

        if delivery_provider_obj.type == OrderDeliveryType.DELIVERY:
            weight = sum(
                [
                    size["quantity"]
                    * product_size_obj_by_id[size["id"]].product.weight_grams
                    for size in cart_sizes
                ]
            )

            delivery_price_obj = get_delivery_price(
                provider_id=delivery_provider_obj.id,
                weight=weight,
                country_id=order_delivery_address_obj.country_id,
                region_id=order_delivery_address_obj.region_id,
            )

            if not delivery_price_obj:
                return None

            delivery_amount = delivery_price_obj.price
            delivery_vat = delivery_price_obj.vat

            if delivery_amount.currency != settings.MODULE_ALL_CURRENCY:
                delivery_amount = Money(
                    convert_money(
                        delivery_amount, settings.MODULE_ALL_CURRENCY
                    ).amount.to_integral(rounding=decimal.ROUND_UP),
                    settings.MODULE_ALL_CURRENCY,
                )
        else:
            delivery_amount = ZERO_MONEY
            delivery_vat = 0

        order_delivery_obj = OrderDelivery.objects.create(
            provider=delivery_provider_obj,
            address=order_delivery_address_obj,
            event_id=event_id,
            price=delivery_price_obj,
            amount=delivery_amount,
            vat=delivery_vat,
        )
    elif order_type == OrderType.MEMBERSHIP:
        membership_module_obj_by_id = {
            membership_module_obj.id: membership_module_obj
            for membership_module_obj in MembershipModule.objects.filter(
                id__in=[cart_module["id"] for cart_module in cart_modules]
            )
            .with_amount_pending()
            .select_related("membership")
        }
    elif order_type == OrderType.COURSE:
        program_course_registration_by_id = {
            program_course_registration_obj.id: program_course_registration_obj
            for program_course_registration_obj in ProgramCourseRegistration.objects.filter(
                id__in=[
                    cart_course_registration["id"]
                    for cart_course_registration in cart_course_registrations
                ]
            ).select_related(
                "course", "course__program", "entity", "entity__user"
            )
        }
    elif order_type == OrderType.REGISTRATION:
        registration_obj_by_id = {
            registration_obj.id: registration_obj
            for registration_obj in Registration.objects.filter(
                id__in=[
                    cart_event_registration["id"]
                    for cart_event_registration in cart_event_registrations
                ]
            ).select_related("event", "entity", "entity__user")
        }

    provider_objs = payment.api.payment_provider.get_list(module=module)
    if provider_objs:
        payment_order_obj = PaymentOrder.objects.create(
            provider=provider_objs[0],
        )
    else:
        payment_order_obj = None

    # TODO: Fix this

    order_obj, __ = Order.objects.get_or_create(
        entity=entity_obj,
        type=order_type,
        status=OrderStatus.CREATED,
        delivery=order_delivery_obj,
        origin_module=module,
        origin_language=translation.get_language(),
        defaults={"payment_order": payment_order_obj},
    )

    if order_type == OrderType.PRODUCT:
        for cart_size in cart_sizes:
            product_size_obj = product_size_obj_by_id[cart_size["id"]]

            if (
                cart_size["quantity"] > product_size_obj.stock
                and not product_size_obj.product.ignore_stock
            ):
                raise ValidationError(
                    {
                        "size": _(
                            "The amount of some products exceed the available stock."
                        )
                    }
                )

            OrderProduct.objects.create(
                order=order_obj,
                size=product_size_obj,
                quantity=cart_size["quantity"],
                amount_unit=product_size_obj.price,
                amount=cart_size["quantity"] * product_size_obj.price,
                vat=product_size_obj.vat,
            )
    elif order_type == OrderType.MEMBERSHIP:
        for cart_module in cart_modules:
            membership_module_obj = membership_module_obj_by_id[cart_module["id"]]

            OrderMembership.objects.update_or_create(
                order=order_obj,
                module=membership_module_obj,
                defaults={
                    "amount": membership_module_obj.amount_pending,
                    "vat": settings.MODULE_ALL_VAT,
                },
            )
    elif order_type == OrderType.COURSE:
        for cart_course_registration in cart_course_registrations:
            program_course_registration_obj = program_course_registration_by_id[
                cart_course_registration["id"]
            ]

            OrderCourse.objects.update_or_create(
                order=order_obj,
                registration=program_course_registration_obj,
                defaults={
                    "amount": program_course_registration_obj.amount,
                    "vat": settings.MODULE_ALL_VAT,
                },
            )
    elif order_type == OrderType.REGISTRATION:
        for cart_event_registration in cart_event_registrations:
            registration_obj = registration_obj_by_id[cart_event_registration["id"]]

            OrderRegistration.objects.update_or_create(
                order=order_obj,
                registration=registration_obj,
                defaults={
                    "amount": registration_obj.price.amount,
                    "vat": settings.MODULE_ALL_VAT,
                },
            )

    if payment_order_obj:
        # Initialise external_id
        update_provider(
            order_id=order_obj.id,
            provider_id=payment_order_obj.provider_id,
            module=module,
        )

    return order_obj


def delete(order_id: UUID, module: Module) -> bool:
    order_obj = (
        Order.objects.filter(id=order_id, status=OrderStatus.CREATED)
        .select_related("entity", "entity__user")
        .first()
    )

    if not order_obj:
        return False

    order_obj.status = OrderStatus.ABANDONED
    order_obj.save(update_fields=("status",))

    if (
        order_obj.payment_order
        and order_obj.payment_order.status <= PaymentStatus.PENDING
    ):
        order_obj.payment_order.status = PaymentStatus.CANCELED
        order_obj.payment_order.save(update_fields=("status",))

    return True


@transaction.atomic
def update_provider(
    order_id: UUID, provider_id: UUID, module: Module, user_id: UUID | None = None
) -> Order | None:
    order_obj = Order.objects.filter(id=order_id, status=OrderStatus.CREATED).first()

    if not order_obj:
        return None

    if order_obj.payment_order:
        payment_order_obj = order_obj.payment_order
    else:
        payment_order_obj = PaymentOrder.objects.create(provider_id=provider_id)
        order_obj.payment_order = payment_order_obj
        order_obj.save(update_fields=("payment_order",))

    payment_classes_by_id = payment.api.payment_provider.get_classes(module=module)

    if payment_order_obj.provider and payment_order_obj.provider_id != provider_id:
        payment_classes_by_id[payment_order_obj.provider_id](order_id=order_id).cancel()

    payment_class = payment_classes_by_id[provider_id](order_id=order_id)
    external_id = payment_class.create()

    payment_order_obj.provider_id = provider_id
    payment_order_obj.external_id = external_id
    payment_order_obj.save(update_fields=("provider_id", "external_id"))

    return get(order_id=order_id, user_id=user_id, module=module)


def clean_pending_orders() -> None:
    # TODO: Check what happens when payment order and order are out of sync
    order_ids = list(
        Order.objects.filter(
            Q(
                status=OrderStatus.CREATED,
                created_at__lte=timezone.now()
                - timezone.timedelta(hours=ORDER_CLEAN_STATUS_CREATED_HOURS)
                - timezone.timedelta(minutes=5),
            )
            | Q(
                status__in=(OrderStatus.REQUESTED, OrderStatus.PROCESSING),
                created_at__lte=timezone.now()
                - timezone.timedelta(hours=ORDER_CLEAN_STATUS_PROCESSING_HOURS),
            )
        ).values_list("id", flat=True)
    )

    Order.objects.filter(id__in=order_ids).update(status=OrderStatus.ABANDONED)

    PaymentOrder.objects.filter(
        order__id__in=order_ids, status__lte=PaymentStatus.PENDING
    ).update(status=PaymentStatus.CANCELED)


# TODO: Should run a background sync to "capture" pending orders
@transaction.atomic
def complete(  # noqa: C901
    order_id: UUID,
    module: Module,
    date_paid: datetime.datetime | None = None,
    transaction_id: str | None = None,
    transaction_reference: str | None = None,
    user_id: UUID | None = None,
    with_notify: bool = True,
) -> Order | None:
    order_obj = (
        Order.objects.filter(id=order_id, status__lte=OrderStatus.REQUESTED)
        .prefetch_related("registrations", "memberships", "courses", "registrations")
        .with_amount()
        .first()
    )

    if not order_obj or not order_obj.payment_order:
        return None

    payment_order_obj = order_obj.payment_order

    payment_class = payment.api.payment_provider.get_class(
        provider_id=payment_order_obj.provider_id
    )(order_id=order_id)
    payment_status = payment_class.capture()

    if payment_status in (
        PaymentStatus.PENDING,
        PaymentStatus.PROCESSING,
        PaymentStatus.COMPLETED,
    ):
        if payment_order_obj.provider.code in PAYMENT_CODE_REQUIRE_SOURCE:
            if (
                payment_order_obj.provider.code != "SUMUP"
                or transaction_id
                or transaction_reference
            ):
                fee_amount = payment_class.fees()

                # TODO: Move vat to money_vat instead to store amounts and not percentages
                payment.api.create_for_order(
                    order_id=order_obj.id,
                    date_accounting=date_paid or timezone.localtime(),
                    external_id=transaction_id,
                    reference=transaction_reference,
                    status=payment_status,
                    fee_amount=fee_amount,
                )

        payment_order_obj.status = payment_status
        payment_order_obj.save(update_fields=("status",))

        order_status_if_completed = (
            OrderStatus.PROCESSING
            if order_obj.type == OrderType.PRODUCT
            else OrderStatus.COMPLETED
        )

        order_obj.status = (
            order_status_if_completed
            if payment_status == PaymentStatus.COMPLETED
            else OrderStatus.REQUESTED
        )
        order_obj.save(update_fields=("status",))

        if payment_status == PaymentStatus.COMPLETED:
            if order_obj.type == OrderType.PRODUCT:
                if with_notify:
                    transaction.on_commit(
                        lambda: notify.tasks.send_order_email.delay(
                            order_id=order_obj.id,
                            email_type=EmailType.ORDER_PAID,
                            module=module,
                            locale=translation.get_language(),
                        )
                    )

                transaction.on_commit(
                    lambda: notify.tasks.send_order_message_slack.delay(
                        order_id=order_obj.id,
                    )
                )
            elif order_obj.type == OrderType.REGISTRATION:
                registration_ids = [
                    order_registration_obj.registration_id
                    for order_registration_obj in order_obj.registrations.all()
                ]
                event.api.registration.complete(
                    registration_ids=registration_ids, with_notify=with_notify
                )
            elif order_obj.type == OrderType.MEMBERSHIP:
                membership_module_ids = [
                    order_membership_obj.module_id
                    for order_membership_obj in order_obj.memberships.all()
                ]
                membership.api.complete(
                    membership_module_ids=membership_module_ids,
                    is_completed=payment_status == PaymentStatus.COMPLETED,
                    with_notify=with_notify,
                )
            elif order_obj.type == OrderType.COURSE:
                program_course_registration_ids = [
                    order_course_obj.registration_id
                    for order_course_obj in order_obj.courses.all()
                ]
                activity.api.course.complete_registrations(
                    registration_ids=program_course_registration_ids,
                    is_completed=payment_status == PaymentStatus.COMPLETED,
                    with_notify=with_notify,
                )

        return get(order_id=order_id, user_id=user_id, module=module)

    return None


@transaction.atomic
def restart(
    order_id: UUID, module: Module, user_id: UUID | None = None
) -> Order | None:
    order_obj = Order.objects.filter(id=order_id, status=OrderStatus.CREATED).first()

    if not order_obj or not order_obj.payment_order:
        return None

    payment_order_obj = order_obj.payment_order

    payment_classes_by_id = payment.api.payment_provider.get_classes(module=module)
    payment_class = payment_classes_by_id[payment_order_obj.provider_id](
        order_id=order_id
    )

    payment_class.cancel()

    external_id = payment_class.create(force=True)

    payment_order_obj.external_id = external_id
    payment_order_obj.save(update_fields=("external_id",))

    return get(order_id=order_id, user_id=user_id, module=module)
