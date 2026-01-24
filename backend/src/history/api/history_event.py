from typing import List

from comunicat.enums import Module
from history.models import HistoryEvent
from legal.models import Team, Member, Group


def get_list(module: Module) -> List[Team]:
    return list(
        HistoryEvent.objects.filter(
            module=module,
        ).order_by("-date")
    )
