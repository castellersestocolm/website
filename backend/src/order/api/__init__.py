from typing import List
from uuid import UUID

from django.db import transaction
from django.db.models import Prefetch, Q, Exists, OuterRef
from django.utils import translation
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
    sizes: list[dict],
    delivery: dict,
    module: Module,
    user_id: UUID | None = None,
    user: dict | None = None,
    pickup: dict | None = None,
    with_notify: bool = True,
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
                    "user_id": user_obj.user_id,
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

    order_delivery_obj = OrderDelivery.objects.create(
        type=delivery_provider_obj.type,
        provider=delivery_provider_obj,
        address=order_delivery_address_obj,
        event_id=event_id,
    )

    # TODO: Fix this

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
