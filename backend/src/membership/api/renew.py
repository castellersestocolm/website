from typing import Any
from uuid import UUID

from django.conf import settings

from comunicat.enums import Module
from membership.utils import (
    get_membership_length,
    get_membership_date_to,
    get_membership_amount,
)
from user.enums import FamilyMemberStatus
from user.models import FamilyMember, User


def get_options(user_id: UUID) -> list[dict[str, list[dict[str, Any]]]]:
    user_obj = User.objects.filter(id=user_id).select_related("family_member").first()
    family_id = (
        user_obj.family_member.family_id if hasattr(user_obj, "family_member") else None
    )

    if family_id is None:
        user_ids = [user_id]
    else:
        user_ids = list(
            {user_id}
            | {
                family_member_obj.user_id
                for family_member_obj in FamilyMember.objects.filter(
                    family_id=family_id, status=FamilyMemberStatus.ACTIVE
                )
            }
        )

    membership_length = get_membership_length(member_count=len(user_ids))

    if not membership_length:
        return []

    date_to = get_membership_date_to(months=membership_length)

    if not date_to:
        return []

    membership_options = []

    for module in Module:
        modules = list({module} | set(settings.MODULE_ALL_MEMBERSHIP_REQUIRED))
        current_options = []
        current_amount = None
        for current_module in modules:
            membership_amount = get_membership_amount(
                member_count=len(user_ids), module=current_module
            )
            current_options.append(
                {"module": current_module, "amount": membership_amount}
            )
            current_amount = (
                current_amount + membership_amount
                if current_amount
                else membership_amount
            )

        membership_options.append(
            {"modules": current_options, "amount": current_amount, "date_to": date_to}
        )

    return membership_options
