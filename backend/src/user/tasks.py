from uuid import UUID

from celery import shared_task

import user.api.google_group


@shared_task
def sync_users(group_id: UUID | None = None) -> None:
    user.api.google_group.sync_users(group_id=group_id)
