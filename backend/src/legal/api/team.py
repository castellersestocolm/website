from typing import List

from django.db.models import Prefetch

from comunicat.enums import Module
from legal.models import Team, Member


def get_list(module: Module) -> List[Team]:
    return list(
        Team.objects.filter(
            module=module,
        )
        .prefetch_related(
            Prefetch(
                "members",
                Member.objects.select_related("user", "role").order_by("role__order"),
            )
        )
        .order_by("type", "-date_from")
    )
