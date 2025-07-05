from typing import List
from uuid import UUID

from django.db.models import Prefetch, Q, Exists, OuterRef

from comunicat.enums import Module
from order.enums import OrderStatus
from order.models import Order, OrderProduct
from user.enums import FamilyMemberStatus
from user.models import FamilyMember

from django.conf import settings


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
                    "size__product__type", "size__category", "size__size"
                ).select_related("size", "size__product", "line"),
            ),
        )
        .with_amount()
        .order_by("-created_at")
    )
