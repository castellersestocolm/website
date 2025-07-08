from uuid import UUID

from django.db.models import Prefetch

import user.api
from user.enums import FamilyMemberStatus, FamilyMemberRole
from user.models import FamilyMember, Family


def get_for_user(user_id: UUID) -> Family | None:
    family_obj = (
        Family.objects.filter(members__user_id=user_id)
        .prefetch_related(
            Prefetch(
                "members",
                FamilyMember.objects.filter(
                    status__in=(FamilyMemberStatus.REQUESTED, FamilyMemberStatus.ACTIVE)
                ).order_by("-role", "user__firstname", "user__lastname"),
            )
        )
        .first()
    )

    if not family_obj:
        family_obj = create_for_user(user_id=user_id)

    return family_obj


def create_for_user(user_id: UUID) -> Family | None:
    user_obj = user.api.get(user_id=user_id)

    if not user_obj:
        return None

    family_member_obj = (
        FamilyMember.objects.filter(user=user_obj, status=FamilyMemberStatus.ACTIVE)
        .select_related("family")
        .first()
    )

    if family_member_obj:
        return family_member_obj.family

    if not user_obj.can_manage:
        return None

    family_obj = Family.objects.create()
    FamilyMember.objects.create(
        user=user_obj,
        family=family_obj,
        role=FamilyMemberRole.MANAGER,
        status=FamilyMemberStatus.ACTIVE,
    )

    return family_obj
