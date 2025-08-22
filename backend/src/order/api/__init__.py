import decimal
from typing import List
from uuid import UUID

from django.db import transaction
from django.db.models import Prefetch, Q, Exists, OuterRef
from django.utils import timezone, translation
from djmoney.contrib.exchange.models import convert_money
from djmoney.money import Money
from rest_framework.exceptions import ValidationError

from comunicat.enums import Module
from data.models import Country, Region
from notify.enums import EmailType
from order.enums import OrderStatus, OrderDeliveryType
from order.models import (
    Order,
    OrderProduct,
    OrderLog,
    OrderDelivery,
    OrderDeliveryAddress,
    DeliveryProvider,
)
from order.utils.delivery import get_delivery_price
from payment.enums import PaymentStatus
from payment.models import Entity, PaymentOrder
from product.models import ProductSize
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User

import payment.api.payment_provider

import notify.tasks

from django.conf import settings

from django.utils.translation import gettext_lazy as _


def get_list(
    module: Module | None = None,
    user_id: UUID | None = None,
    order_id: UUID | None = None,
) -> List[Order]:
    order_filter = Q()
    order_annotate = {}

    if order_id:
        order_filter = Q(id=order_id)

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
        if not order_id:
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
                OrderProduct.objects.order_by(
                    "size__product__type", "size__order", "size__category", "size__size"
                )
                .select_related("size", "size__product", "line")
                .prefetch_related("size__product__images")
                .with_name(),
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
def create(
    sizes: list[dict],
    delivery: dict,
    module: Module,
    user_id: UUID | None = None,
    user: dict | None = None,
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

    delivery_provider_obj = DeliveryProvider.objects.get(id=delivery["provider"]["id"])

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
            id__in=[size["id"] for size in sizes]
        )
        .select_related("product")
        .with_price(modules=modules)
        .with_stock()
    }

    if delivery_provider_obj.type == OrderDeliveryType.DELIVERY:
        weight = sum(
            [
                size["quantity"]
                * product_size_obj_by_id[size["id"]].product.weight_grams
                for size in sizes
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
        delivery_amount = Money("0", settings.MODULE_ALL_CURRENCY)
        delivery_vat = 0

    order_delivery_obj = OrderDelivery.objects.create(
        provider=delivery_provider_obj,
        address=order_delivery_address_obj,
        event_id=event_id,
        amount=delivery_amount,
        vat=delivery_vat,
    )

    provider_objs = payment.api.payment_provider.get_list(module=module)
    if provider_objs:
        payment_order_obj = PaymentOrder.objects.create(
            provider=provider_objs[0],
        )
    else:
        payment_order_obj = None

    # TODO: Fix this

    order_obj = Order.objects.create(
        entity=entity_obj,
        delivery=order_delivery_obj,
        payment_order=payment_order_obj,
        origin_module=module,
    )

    for size in sizes:
        product_size_obj = product_size_obj_by_id[size["id"]]

        if (
            size["quantity"] > product_size_obj.stock
            and not product_size_obj.product.ignore_stock
        ):
            raise ValidationError(
                {"size": _("The amount of some products exceed the available stock.")}
            )

        OrderProduct.objects.create(
            order=order_obj,
            size=product_size_obj,
            quantity=size["quantity"],
            amount_unit=product_size_obj.price,
            amount=size["quantity"] * product_size_obj.price,
            vat=product_size_obj.vat,
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

    # TODO: Update status on payment order
    order_obj.status = OrderStatus.ABANDONED
    order_obj.save(update_fields=("status",))

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
    payment_class = payment_classes_by_id[provider_id](order_id=order_id)
    external_id = payment_class.create()

    payment_order_obj.provider_id = provider_id
    payment_order_obj.external_id = external_id
    payment_order_obj.save(update_fields=("provider_id", "external_id"))

    return get(order_id=order_id, user_id=user_id, module=module)


def clean_pending_orders() -> None:
    # TODO: Move delta to a setting perhaps
    # TODO: Update status on payment order
    Order.objects.filter(
        status=OrderStatus.CREATED,
        created_at__lte=timezone.now() - timezone.timedelta(hours=1),
    ).update(status=OrderStatus.ABANDONED)


@transaction.atomic
def complete(
    order_id: UUID,
    module: Module,
    user_id: UUID | None = None,
    with_notify: bool = True,
) -> Order | None:
    order_obj = Order.objects.filter(id=order_id, status=OrderStatus.CREATED).first()

    if not order_obj.payment_order:
        return None

    payment_order_obj = order_obj.payment_order

    is_captured = False
    is_completed = False

    if payment_order_obj.provider.code in ("SWISH", "TRANSFER"):
        is_captured = True
    elif payment_order_obj.provider.code == "PAYPAL":
        payment_class = payment.api.payment_provider.get_class(
            provider_id=payment_order_obj.provider_id
        )(order_id=order_id)
        is_captured = payment_class.capture()
        is_completed = is_captured

    if is_captured:
        payment_order_obj.status = (
            PaymentStatus.COMPLETED if is_completed else PaymentStatus.PROCESSING
        )
        payment_order_obj.save(update_fields=("status",))

        order_obj.status = OrderStatus.PROCESSING
        order_obj.save(update_fields=("status",))

        if with_notify:
            notify.tasks.send_order_email.delay(
                order_id=order_obj.id,
                email_type=EmailType.ORDER_CREATED,
                module=module,
                locale=translation.get_language(),
            )

            notify.tasks.send_order_message_slack.delay(
                order_id=order_obj.id,
            )

        return get(order_id=order_id, user_id=user_id, module=module)

    return None
