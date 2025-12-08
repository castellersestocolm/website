from uuid import UUID

from celery import shared_task

import activity.api.google_drive


# TODO: https://stackoverflow.com/questions/45107418/is-it-possible-to-skip-delegating-a-celery-task-if-the-params-and-the-task-name
@shared_task(rate_limit="1/m")
def sync_program(program_id: UUID) -> None:
    activity.api.google_drive.sync_program(program_id=program_id)
