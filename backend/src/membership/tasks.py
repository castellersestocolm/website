from celery import shared_task

import membership.api.google_drive
from comunicat.enums import Module


# TODO: Pick the right module
@shared_task(rate_limit="1/m")
def sync_memberships() -> None:
    membership.api.google_drive.sync_memberships(module=Module.TOWERS)
