from celery import shared_task

import order.api


@shared_task
def clean_pending_orders() -> None:
    order.api.clean_pending_orders()
