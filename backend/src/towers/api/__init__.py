from uuid import UUID

import pinyator.api

from towers.types import Tower


def get_towers_for_event(event_id: UUID) -> list[Tower]:
    return pinyator.api.get_towers_for_event(event_id=event_id)
