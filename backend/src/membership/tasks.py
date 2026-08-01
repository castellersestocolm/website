from celery import shared_task

import membership.api.google_drive
from comunicat.enums import Module


# TODO: Pick the right module
@shared_task(rate_limit="1/m")
def sync_memberships() -> None:
    for module in Module:
        membership.api.google_drive.sync_memberships(module=module)


@shared_task(rate_limit="1/m")
def sync_memberships_org() -> None:
    membership.api.google_drive.sync_memberships(module=Module.ORG)


@shared_task(rate_limit="1/m")
def sync_memberships_towers() -> None:
    membership.api.google_drive.sync_memberships(module=Module.TOWERS)
