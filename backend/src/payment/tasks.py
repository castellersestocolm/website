from uuid import UUID

from celery import shared_task
from django.conf import settings

import payment.api.google_drive


# TODO: Pick the right module
@shared_task
def sync_statement(statement_id: UUID) -> None:
    payment.api.google_drive.sync_statement(
        statement_id=statement_id, module=settings.MODULE_DEFAULT
    )
