from uuid import UUID

from django.db.models import Prefetch

import user.api
from comunicat.enums import Module
from user.enums import FamilyMemberStatus, FamilyMemberRole
from user.models import FamilyMember, Family


def get_user_ids(user_id: UUID, only_active: bool = True) -> list[UUID]:
    return list(
        {user_id}
        | {
            family_member_obj.user_id
            # TODO: Review this as it could be wrong
            for family_member_obj in FamilyMember.objects.filter(
                family__members__user_id=user_id,
                status__in=(
                    (FamilyMemberStatus.ACTIVE,)
                    if only_active
                    else (FamilyMemberStatus.REQUESTED, FamilyMemberStatus.ACTIVE)
                ),
            )
        }
    )


def get_for_user(user_id: UUID, module: Module | None = None) -> Family | None:
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
        family_obj = create_for_user(user_id=user_id, module=module)

    return family_obj


def create_for_user(user_id: UUID, module: Module | None = None) -> Family | None:
    user_obj = user.api.get(user_id=user_id, module=module)

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
