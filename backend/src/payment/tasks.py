from uuid import UUID

from celery import shared_task

import payment.api.google_drive
import payment.api.websocket
from comunicat.enums import Module
from payment.enums import PaymentStatus


# TODO: Pick the right module
@shared_task
def sync_statement(statement_id: UUID) -> None:
    payment.api.google_drive.sync_statement(
        statement_id=statement_id, module=Module.ORG
    )


@shared_task
def send_websocket_order_message(order_id: UUID, payment_status: PaymentStatus) -> None:
    payment.api.websocket.send_order_message(
        order_id=order_id, payment_status=payment_status
    )
