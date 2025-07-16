from typing import List
from uuid import UUID

from django.db import transaction
from django.db.models import Prefetch, Q, Exists, OuterRef
from django.utils import translation
from rest_framework.exceptions import ValidationError

from comunicat.enums import Module
from notify.enums import EmailType
from order.enums import OrderStatus, OrderDeliveryType
from order.models import Order, OrderProduct, OrderLog, OrderDelivery
from payment.models import Entity
from product.models import ProductSize
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User

import notify.tasks

from django.conf import settings

from django.utils.translation import gettext_lazy as _


def get_list(user_id: UUID, module: Module) -> List[Order]:
    return list(
        Order.objects.annotate(
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
        .exclude(status=OrderStatus.CANCELLED)
        # .annotate(
        #     date=Case(
        #         When(transaction__isnull=False, then=F("transaction__date_accounting")),
        #         output_field=DateField(),
        #         # Warning: Potentially incorrect depending on the timezone
        #         default=F("created_at__date"),
        #     )
        # )
        .select_related("entity", "delivery")
        .prefetch_related(
            Prefetch(
                "products",
                OrderProduct.objects.order_by(
                    "size__product__type", "size__order", "size__category", "size__size"
                )
                .select_related("size", "size__product", "line")
                .prefetch_related("size__product__images"),
            ),
            Prefetch("logs", OrderLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .order_by("-created_at")
    )


@transaction.atomic
def create(
    sizes: list[dict], user_id: UUID, module: Module, with_notify: bool = True
) -> Order | None:
    if user_id:
        user_obj = User.objects.filter(id=user_id).with_has_active_membership().first()
        modules = [
            module
            for module in Module
            if getattr(user_obj, f"membership_{module}", False)
        ]
    else:
        modules = []

    order_delivery_obj = OrderDelivery.objects.create(type=OrderDeliveryType.PICK_UP)

    # TODO: Fix this
    entity_obj = Entity.objects.get(user__isnull=False, user_id=user_id)

    order_obj = Order.objects.create(
        entity=entity_obj,
        delivery=order_delivery_obj,
        origin_module=module,
    )

    product_size_obj_by_id = {
        product_size_obj.id: product_size_obj
        for product_size_obj in ProductSize.objects.filter(
            id__in=[size["id"] for size in sizes]
        )
        .select_related("product")
        .with_price(modules=modules)
        .with_stock()
    }

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

    if with_notify:
        notify.tasks.send_order_email.delay(
            order_id=order_obj.id,
            email_type=EmailType.ORDER_CREATED,
            module=module,
            locale=translation.get_language(),
        )

    return order_obj
