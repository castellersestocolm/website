from uuid import UUID

from celery import shared_task

import event.api.google_calendar


@shared_task
def import_events() -> None:
    event.api.google_calendar.import_events()


@shared_task
def create_or_update_event(event_id: UUID, registration_id: UUID | None = None) -> None:
    event.api.google_calendar.create_or_update_event(
        event_id=event_id, registration_id=registration_id
    )
