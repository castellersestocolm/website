import json
from uuid import UUID

import redis
from django.conf import settings

from payment.enums import PaymentStatus

red = redis.from_url(settings.CELERY_BROKER_URL)


def make_socker_message(channel: str, data: dict) -> str:
    return channel + "|" + json.dumps(data)


def get_order_socker_channel(order_id: UUID) -> str:
    return f"order-{order_id}"


def send_order_message(order_id: UUID, payment_status: PaymentStatus) -> None:
    channel = get_order_socker_channel(order_id=order_id)

    message = {"status": payment_status}

    red.publish(
        "socker",
        make_socker_message(channel=channel, data=message),
    )
