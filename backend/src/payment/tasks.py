from uuid import UUID

from celery import shared_task

import payment.api.google_drive
from comunicat.enums import Module


# TODO: Pick the right module
@shared_task
def sync_statement(statement_id: UUID) -> None:
    payment.api.google_drive.sync_statement(
        statement_id=statement_id, module=Module.TOWERS
    )
