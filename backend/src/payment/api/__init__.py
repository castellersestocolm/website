from typing import List
from uuid import UUID

from django.db.models import Prefetch, Q, Exists, OuterRef

from comunicat.enums import Module
from payment.enums import PaymentStatus
from payment.models import Payment, PaymentLine, PaymentLog
from user.enums import FamilyMemberStatus
from user.models import FamilyMember


def get_list(user_id: UUID, module: Module) -> List[Payment]:
    return list(
        Payment.objects.annotate(
            is_user_membership_related=Exists(
                FamilyMember.objects.filter(
                    status=FamilyMemberStatus.ACTIVE,
                    user_id=user_id,
                    family__membership_users__membership__modules__payment_lines__payment_id=OuterRef(
                        "id"
                    ),
                )
            )
        )
        .filter(Q(entity__user_id=user_id) | Q(is_user_membership_related=True))
        .exclude(status=PaymentStatus.CANCELED)
        .prefetch_related(
            Prefetch(
                "lines", PaymentLine.objects.with_description().order_by("amount")
            ),
            Prefetch("logs", PaymentLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .with_description()
        .order_by("-created_at")
    )
