from typing import Optional
from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.urls import reverse
from django.utils import timezone, translation
from drf_yasg.openapi import Contact

from comunicat.enums import Module
from comunicat.template_tags.comunicat_tags import full_url, full_media
from notify.api.slack import get_client

from django.utils.translation import gettext_lazy as _

from notify.enums import MessageSlackType, ContactMessageStatus, ContactMessageType
from notify.models import MessageSlack, ContactMessage
from order.enums import OrderStatus
from order.models import Order, OrderProduct, OrderLog
from product.models import ProductSize


def post_message(channel_id: str, blocks: list[dict], module: Module) -> Optional[str]:
    client = get_client(module=module)

    response_message = client.chat_post_message(channel=channel_id, blocks=blocks)

    if response_message["ok"]:
        return response_message["ts"]

    return None


def send_order_message(order_id: UUID) -> MessageSlack:
    order_obj = (
        Order.objects.filter(id=order_id)
        .select_related(
            "entity",
            "delivery",
            "delivery__provider",
            "delivery__address",
            "delivery__address__country",
            "delivery__address__region",
            "payment_order",
            "payment_order__provider",
        )
        .prefetch_related(
            Prefetch(
                "products",
                OrderProduct.objects.order_by(
                    "size__product__type", "size__order", "size__category", "size__size"
                )
                .select_related("size", "size__product", "line")
                .prefetch_related("size__product__images")
                .with_name(),
            ),
            Prefetch("logs", OrderLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .order_by("-created_at")
        .first()
    )

    product_size_obj_by_id = {
        product_size_obj.id: product_size_obj
        for product_size_obj in ProductSize.objects.filter(
            id__in=[
                order_product_obj.size_id
                for order_product_obj in order_obj.products.all()
            ]
        ).with_stock()
    }

    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{_('A new order has just been placed!')}\n*<{full_url(path=reverse("admin:order_order_change", args=(str(order_id),)))}|{order_obj.entity.full_name} — {timezone.localtime(order_obj.created_at).strftime('%Y-%m-%d %H:%M')}>*",
            },
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Reference*\n{order_obj.reference}"},
                {
                    "type": "mrkdwn",
                    "text": f"*Status*\n{OrderStatus(order_obj.status).name.capitalize()}",
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Delivery*\n{str(order_obj.delivery.provider)}",
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Payment*\n{str(order_obj.payment_order)}",
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Amount*\n{int(order_obj.amount.amount)} {order_obj.amount.currency}",
                },
                {
                    "type": "mrkdwn",
                    "text": f"*VAT*\n{int(order_obj.amount_vat.amount)} {order_obj.amount_vat.currency}",
                },
            ],
        },
        {"type": "divider"},
        *(
            [
                section
                for order_product_obj in order_obj.products.all()
                for section in [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*{order_product_obj.quantity} x {order_product_obj.name_locale} — {order_product_obj.size.size}*\nAmount: {int(order_product_obj.amount.amount)} {order_product_obj.amount.currency}\nCurrent stock: {product_size_obj_by_id[order_product_obj.size_id].stock + order_product_obj.quantity} → {product_size_obj_by_id[order_product_obj.size_id].stock}",
                        },
                        **(
                            {
                                "accessory": {
                                    "type": "image",
                                    "image_url": full_media(
                                        path=order_product_obj.size.product.images.first().picture.url
                                    ),
                                    "alt_text": order_product_obj.name_locale,
                                }
                            }
                            if order_product_obj.size.product.images.exists()
                            else {}
                        ),
                    },
                    {"type": "divider"},
                ]
            ]
        ),
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": str(_("View order")),
                        "emoji": True,
                    },
                    "url": full_url(
                        path=reverse("admin:order_order_change", args=(str(order_id),))
                    ),
                }
            ],
        },
    ]

    channel_id = getattr(
        settings, f"SLACK_{Module(order_obj.origin_module).name}_CHANNEL_ORDERS"
    )

    message_id = post_message(
        channel_id=channel_id, blocks=blocks, module=order_obj.origin_module
    )

    return MessageSlack.objects.create(
        channel_id=channel_id,
        message_id=message_id,
        type=MessageSlackType.ORDER_CREATED,
        module=order_obj.origin_module,
        locale=translation.get_language(),
        blocks=blocks,
    )


def send_contact_message(message_id: UUID) -> MessageSlack:
    contact_message_obj = (
        ContactMessage.objects.filter(id=message_id)
        .select_related(
            "entity",
        )
        .first()
    )

    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{_('A new contact message has just been sent!')}\n*<{full_url(path=reverse("admin:notify_contactmessage_change", args=(str(message_id),)))}|{contact_message_obj.entity.full_name} — {timezone.localtime(contact_message_obj.created_at).strftime('%Y-%m-%d %H:%M')}>*",
            },
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Type*\n{ContactMessageType(contact_message_obj.type).name.capitalize().replace('_', ' ')}",
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Status*\n{ContactMessageStatus(contact_message_obj.status).name.capitalize()}",
                },
            ],
        },
        {"type": "divider"},
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": contact_message_obj.message,
            },
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": str(_("View message")),
                        "emoji": True,
                    },
                    "url": full_url(
                        path=reverse(
                            "admin:notify_contactmessage_change",
                            args=(str(message_id),),
                        )
                    ),
                }
            ],
        },
    ]

    channel_id = getattr(
        settings, f"SLACK_{Module(contact_message_obj.module).name}_CHANNEL_CONTACT"
    )

    message_id = post_message(
        channel_id=channel_id, blocks=blocks, module=contact_message_obj.module
    )

    return MessageSlack.objects.create(
        channel_id=channel_id,
        message_id=message_id,
        type=MessageSlackType.CONTACT_MESSAGE_CREATED,
        module=contact_message_obj.module,
        locale=translation.get_language(),
        blocks=blocks,
    )
