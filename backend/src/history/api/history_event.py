import datetime
from typing import List
from uuid import UUID

from comunicat.enums import Module
from history.models import HistoryEvent


def get_list(module: Module) -> List[HistoryEvent]:
    return list(
        HistoryEvent.objects.filter(
            module=module,
        ).order_by("-date")
    )


def update(
    history_event_id: UUID,
    date: datetime.date,
    title: dict[str, str],
    description: dict[str, str],
    icon: str,
    module: Module,
) -> HistoryEvent:
    history_event_obj = HistoryEvent.objects.get(id=history_event_id)

    history_event_obj.date = date
    history_event_obj.title = title
    history_event_obj.description = description
    history_event_obj.icon = icon

    history_event_obj.save(update_fields=("date", "title", "description", "icon"))

    return history_event_obj
