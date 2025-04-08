from uuid import UUID

from django.db.models import Prefetch

from user.enums import FamilyMemberStatus
from user.models import FamilyMember, Family


def get_for_user(user_id: UUID) -> Family:
    return (
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
