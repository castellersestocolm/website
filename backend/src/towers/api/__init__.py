from uuid import UUID

import pinyator.api

from towers.types import Tower


def get_towers_for_event(event_id: UUID, user_id: UUID | None = None) -> list[Tower]:
    return pinyator.api.get_towers_for_event(event_id=event_id, user_id=user_id)
