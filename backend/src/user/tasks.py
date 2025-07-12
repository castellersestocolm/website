from celery import shared_task

import user.api.google_group


@shared_task
def sync_users() -> None:
    user.api.google_group.sync_users()
