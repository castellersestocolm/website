import datetime
from uuid import UUID

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import (
    BooleanField,
    Case,
    DateField,
    Exists,
    F,
    OuterRef,
    Prefetch,
    Q,
    Value,
    When,
)
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from djmoney.money import Money

from comunicat.enums import Module
from order.enums import OrderStatus, OrderType
from order.models import (
    Order,
    OrderCourse,
    OrderMembership,
    OrderProduct,
    OrderRegistration,
)
from payment.enums import PaymentStatus, PaymentType
from payment.models import Payment, PaymentLine, PaymentLog, Transaction
from user.enums import FamilyMemberStatus
from user.models import FamilyMember


def get_list(user_id: UUID, module: Module) -> list[Payment]:
    return list(
        Payment.objects.annotate(
            is_user_related=(
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
        )
        .filter(Q(entity__user_id=user_id) | Q(is_user_related=True))
        .exclude(status=PaymentStatus.CANCELED)
        .annotate(
            date=Case(
                When(
                    transaction__isnull=False,
                    then=F("transaction__date_accounting"),
                ),
                output_field=DateField(),
                # Warning: Potentially incorrect depending on the timezone
                default=F("created_at__date"),
            )
        )
        .select_related("entity", "transaction")
        .prefetch_related(
            Prefetch(
                "lines",
                PaymentLine.objects.with_description()
                .annotate(
                    is_delivery=Case(
                        When(
                            Q(
                                item_type__app_label="order",
                                item_type__model="orderdelivery",
                            ),
                            then=Value(True),
                        ),
                        default=Value(False),
                        output_field=BooleanField(),
                    )
                )
                .order_by("is_delivery", "amount", "product_name_locale")
                .select_related("receipt"),
            ),
            Prefetch("logs", PaymentLog.objects.all().order_by("-created_at")),
            # Prefetch(
            #     "payment_receipts",
            #     PaymentReceipt.objects.select_related("receipt").order_by(
            #         "-created_at"
            #     ),
            #     to_attr="receipts",
            # ),
        )
        .with_amount()
        .with_description()
        .order_by("-date", "-created_at", "id")
        .distinct()
    )


@transaction.atomic
def create_for_order(  # noqa: C901
    order_id: UUID,
    status: PaymentStatus,
    date_accounting: datetime.datetime,
    external_id: str | None = None,
    reference: str | None = None,
    fee_amount: Money | None = None,
) -> Payment:
    order_obj = (
        Order.objects.filter(id=order_id, status__lte=OrderStatus.REQUESTED)
        .with_amount()
        .select_related(
            "delivery", "delivery__provider", "delivery__provider__accounts"
        )
        .prefetch_related(
            Prefetch(
                "products",
                OrderProduct.objects.select_related(
                    "size", "size__product", "size__product__accounts"
                ),
                to_attr="all_products",
            ),
            Prefetch(
                "registrations",
                OrderRegistration.objects.select_related(
                    "registration",
                    "registration__event",
                    "registration__event__accounts",
                ),
                to_attr="all_registrations",
            ),
            Prefetch(
                "memberships",
                OrderMembership.objects.select_related(
                    "module",
                    "module__membership",
                ),
                to_attr="all_memberships",
            ),
            Prefetch(
                "courses",
                OrderCourse.objects.select_related(
                    "registration",
                    "registration__course",
                    "registration__course__program",
                    "registration__entity",
                    "registration__entity__user",
                ),
                to_attr="all_courses",
            ),
        )
        .first()
    )

    assert order_obj is not None

    payment_order_obj = order_obj.payment_order

    assert payment_order_obj.provider.source is not None
    source_obj = payment_order_obj.provider.source

    order_product_updates = []
    order_registration_updates = []
    order_membership_updates = []
    order_course_updates = []

    with translation.override(
        language=order_obj.origin_language or settings.LANGUAGE_CODE
    ):
        if order_obj.type == OrderType.MEMBERSHIP:
            text_order = _("Membership")
            text_year = order_obj.all_memberships[0].module.membership.date_from.year
            text = f"{text_order} {text_year}"
        elif order_obj.type == OrderType.COURSE:
            text = order_obj.all_courses[0].registration.course.program.name_locale
        else:
            text_order = _("Order")
            text = f"{text_order} #{order_obj.reference}"

        transaction_obj, __ = Transaction.objects.update_or_create(
            source=source_obj,
            external_id=external_id,
            reference=reference,
            method=payment_order_obj.provider.method,
            amount=order_obj.amount,
            vat=settings.MODULE_ALL_VAT,
            date_accounting=date_accounting,
            # TODO: Check if this is OK
            date_interest=date_accounting,
            defaults={"text": text, "sender": order_obj.entity.name.upper()},
        )

        payment_obj, __ = Payment.objects.update_or_create(
            type=PaymentType.DEBIT,
            method=transaction_obj.method,
            transaction=transaction_obj,
            entity=order_obj.entity,
            defaults={
                "text": text,
                "status": status,
            },
        )

        item_type_order_product = ContentType.objects.get_by_natural_key(
            "order", "orderproduct"
        )
        item_type_order_registration = ContentType.objects.get_by_natural_key(
            "order", "orderregistration"
        )
        item_type_order_membership = ContentType.objects.get_by_natural_key(
            "order", "ordermembership"
        )
        item_type_order_course = ContentType.objects.get_by_natural_key(
            "order", "ordercourse"
        )
        item_type_order_delivery = ContentType.objects.get_by_natural_key(
            "order", "orderdelivery"
        )

        for order_product_obj in order_obj.all_products:
            account_product_obj = (
                order_product_obj.size.product.accounts.payment_debit
                if hasattr(order_product_obj.size.product, "accounts")
                else None
            )
            payment_line_obj, __ = PaymentLine.objects.update_or_create(
                payment=payment_obj,
                amount=order_product_obj.amount,
                vat=order_product_obj.vat,
                text=order_product_obj.size.product.name_locale,
                item_type=item_type_order_product,
                item_id=order_product_obj.id,
                defaults={
                    "account": account_product_obj,
                },
            )
            order_product_obj.line = payment_line_obj
            order_product_updates.append(order_product_obj)

        for order_registration_obj in order_obj.all_registrations:
            account_registration_obj = (
                order_registration_obj.registration.event.accounts.registration_debit
                if hasattr(order_registration_obj.registration.event, "accounts")
                else None
            )
            payment_line_obj, __ = PaymentLine.objects.update_or_create(
                payment=payment_obj,
                amount=order_registration_obj.amount,
                vat=order_registration_obj.vat,
                text=order_registration_obj.registration.event.title_locale,
                item_type=item_type_order_registration,
                item_id=order_registration_obj.id,
                defaults={
                    "account": account_registration_obj,
                },
            )
            order_registration_obj.line = payment_line_obj
            order_registration_updates.append(order_registration_obj)

        # TODO order membership: Register the correct accounts
        for order_membership_obj in order_obj.all_memberships:
            payment_line_obj, __ = PaymentLine.objects.update_or_create(
                payment=payment_obj,
                amount=order_membership_obj.amount,
                vat=order_membership_obj.vat,
                text=f"{str(_('Membership'))} {getattr(settings, f'MODULE_{Module(order_membership_obj.module.module).name}_SHORT_NAME')}",
                item_type=item_type_order_membership,
                item_id=order_membership_obj.id,
            )
            order_membership_obj.line = payment_line_obj
            order_membership_updates.append(order_membership_obj)

        for order_course_obj in order_obj.all_courses:
            payment_line_obj, __ = PaymentLine.objects.update_or_create(
                payment=payment_obj,
                amount=order_course_obj.amount,
                vat=order_course_obj.vat,
                text=f"{order_course_obj.registration.course.program.name_locale} — {order_course_obj.registration.entity.name}",
                item_type=item_type_order_course,
                item_id=order_course_obj.id,
            )
            order_course_obj.line = payment_line_obj
            order_course_updates.append(order_course_obj)

        if order_obj.delivery:
            text_delivery = _("Delivery")
            account_delivery_obj = (
                order_obj.delivery.provider.accounts.payment_debit
                if hasattr(order_obj.delivery.provider, "accounts")
                else None
            )
            payment_line_obj, __ = PaymentLine.objects.update_or_create(
                payment=payment_obj,
                amount=order_obj.delivery.amount,
                vat=order_obj.delivery.vat,
                text=f"{text_delivery} — {order_obj.delivery.provider.name_locale}",
                item_type=item_type_order_delivery,
                item_id=order_obj.delivery.id,
                defaults={
                    "account": account_delivery_obj,
                },
            )
            order_obj.delivery.line = payment_line_obj
            order_obj.delivery.save(update_fields=("line",))

        if order_product_updates:
            OrderProduct.objects.bulk_update(order_product_updates, fields=("line",))

        if order_registration_updates:
            OrderRegistration.objects.bulk_update(
                order_registration_updates, fields=("line",)
            )

        if order_membership_updates:
            OrderMembership.objects.bulk_update(
                order_membership_updates, fields=("line",)
            )

        if order_course_updates:
            OrderCourse.objects.bulk_update(order_course_updates, fields=("line",))

        if fee_amount:
            account_fees_obj = (
                payment_order_obj.provider.accounts.payment_fees
                if hasattr(payment_order_obj.provider, "accounts")
                else None
            )

            text_order_fee = _("Order fee")
            text_fee = f"{text_order_fee} #{order_obj.reference}"

            transaction_fee_obj, __ = Transaction.objects.update_or_create(
                source=source_obj,
                external_id=external_id,
                reference=reference,
                method=payment_order_obj.provider.method,
                amount=-fee_amount,
                vat=settings.MODULE_ALL_VAT,
                date_accounting=date_accounting,
                # TODO: Check if this is OK
                date_interest=date_accounting,
                defaults={"text": text_fee},
            )

            payment_fee_obj, __ = Payment.objects.update_or_create(
                type=PaymentType.CREDIT,
                method=transaction_fee_obj.method,
                transaction=transaction_fee_obj,
                entity=payment_order_obj.provider.entity,
                defaults={
                    "text": text_fee,
                    "status": status,
                },
            )

            PaymentLine.objects.update_or_create(
                payment=payment_fee_obj,
                amount=fee_amount,
                vat=settings.MODULE_ALL_VAT,
                defaults={
                    "account": account_fees_obj,
                },
            )

    return payment_obj
