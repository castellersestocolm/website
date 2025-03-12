from uuid import UUID

from celery import shared_task

import pinyator.api


@shared_task
def update_or_create_user(user_id: UUID) -> None:
    return pinyator.api.update_or_create_user(user_id=user_id)


@shared_task
def update_or_create_event(event_id: UUID) -> None:
    return pinyator.api.update_or_create_event(event_id=event_id)


@shared_task
def update_or_create_registration(registration_id: UUID) -> None:
    return pinyator.api.update_or_create_registration(registration_id=registration_id)
