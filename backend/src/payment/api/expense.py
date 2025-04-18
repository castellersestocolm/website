from typing import List
from uuid import UUID

from django.db.models import Prefetch, Q, Exists, OuterRef

from comunicat.enums import Module
from payment.enums import ExpenseStatus
from payment.models import Expense, Receipt, ExpenseLog
from user.enums import FamilyMemberStatus
from user.models import FamilyMember

from django.conf import settings


def get_list(user_id: UUID, module: Module) -> List[Expense]:
    return list(
        Expense.objects.annotate(
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
                        family__membership_users__membership__modules__payment_lines__receipt__expense_id=OuterRef(
                            "id"
                        ),
                    )
                )
            )
        )
        .filter(Q(entity__user_id=user_id) | Q(is_user_related=True))
        .exclude(status=ExpenseStatus.DELETED)
        .select_related("entity")
        .prefetch_related(
            Prefetch("receipts", Receipt.objects.order_by("date", "amount")),
            Prefetch("logs", ExpenseLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .with_description()
        .order_by("-created_at")
    )
