from typing import List

from django.db.models import Prefetch
from django.utils import timezone

from comunicat.enums import Module
from legal.models import Team, Member, Group


def get_list(module: Module) -> List[Team]:
    return list(
        Group.objects.filter(
            module=module,
            date_from__lte=timezone.localdate(),
        )
        .prefetch_related(
            Prefetch(
                "teams",
                Team.objects.prefetch_related(
                    Prefetch(
                        "members",
                        Member.objects.select_related("user", "role").order_by(
                            "role__order", "user__firstname", "user__lastname"
                        ),
                    )
                ).order_by("type"),
            )
        )
        .order_by("-date_from")
    )
