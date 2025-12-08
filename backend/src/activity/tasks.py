from uuid import UUID

from celery import shared_task

import activity.api.google_drive


@shared_task
def sync_program(program_id: UUID) -> None:
    activity.api.google_drive.sync_program(program_id=program_id)
