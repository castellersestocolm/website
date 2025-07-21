from typing import List

from django.db.models import Prefetch, Q
from django.utils import timezone

from comunicat.enums import Module
from legal.models import Team, Member


def get_list(module: Module) -> List[Team]:
    return list(
        Team.objects.filter(
            Q(date_to__isnull=True) | Q(date_to__gte=timezone.localdate()),
            date_from__lte=timezone.localdate(),
            module=module,
        )
        .prefetch_related(
            Prefetch(
                "members",
                Member.objects.select_related("user", "role").order_by(
                    "role__order", "user__firstname", "user__lastname"
                ),
            )
        )
        .order_by("type", "-date_from")
    )
