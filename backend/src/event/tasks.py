from typing import List
from uuid import UUID

from celery import shared_task

import event.api
import event.api.google_calendar
import event.api.google_album
from comunicat.enums import Module


@shared_task
def import_events() -> None:
    event.api.google_calendar.import_events()


@shared_task
def send_events_signup(
    user_ids: List[UUID] | None = None, module: Module | None = None
) -> None:
    event.api.send_events_signup(user_ids=user_ids, module=module)


@shared_task
def send_events_signup_org() -> None:
    event.api.send_events_signup(module=Module.ORG)


@shared_task
def send_events_signup_towers() -> None:
    event.api.send_events_signup(module=Module.TOWERS)


@shared_task
def create_or_update_event(event_id: UUID, registration_id: UUID | None = None) -> None:
    event.api.google_calendar.create_or_update_event(
        event_id=event_id, registration_id=registration_id
    )


@shared_task
def create_or_update_album(event_id: UUID) -> None:
    event.api.google_album.create_or_update_album(event_id=event_id)
