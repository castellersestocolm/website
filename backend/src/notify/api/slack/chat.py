from typing import Optional
from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.urls import reverse
from django.utils import timezone, translation
from django.utils.translation import gettext_lazy as _

from comunicat.enums import Module
from comunicat.template_tags.comunicat_tags import format_phone, full_media, full_url
from consent.enums import ConsentType
from event.enums import RegistrationStatus
from event.models import Registration
from notify.api.slack import get_client
from notify.enums import ContactMessageStatus, ContactMessageType, MessageSlackType
from notify.models import ContactMessage, MessageSlack
from order.enums import OrderStatus
from order.models import Order, OrderLog, OrderProduct
from product.models import ProductSize
from user.models import User


def post_message(
    channel_id: str,
    blocks: list[dict],
    module: Module,
    unfurl_links: bool = True,
    unfurl_media: bool = True,
) -> Optional[str]:
    client = get_client(module=module)

    response_message = client.chat_post_message(
        channel=channel_id,
        blocks=blocks,
        unfurl_links=unfurl_links,
        unfurl_media=unfurl_media,
    )

    if response_message["ok"]:
        return response_message["ts"]

    return None


def send_order_message(order_id: UUID) -> MessageSlack | None:
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

    if not order_obj:
        return None

    channel_id = getattr(
        settings, f"SLACK_{Module(order_obj.origin_module).name}_CHANNEL_ORDERS"
    )

    if not channel_id:
        return None

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
        item=order_obj,
    )


def send_contact_message(contact_message_id: UUID) -> MessageSlack | None:
    contact_message_obj = (
        ContactMessage.objects.filter(id=contact_message_id)
        .select_related(
            "entity",
        )
        .first()
    )

    if not contact_message_obj:
        return None

    channel_id = getattr(
        settings, f"SLACK_{Module(contact_message_obj.module).name}_CHANNEL_CONTACT"
    )

    if not channel_id:
        return None

    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{_('A new contact message has just been sent!')}\n*<{full_url(path=reverse("admin:notify_contactmessage_change", args=(str(contact_message_id),)))}|{contact_message_obj.entity.full_name} — {timezone.localtime(contact_message_obj.created_at).strftime('%Y-%m-%d %H:%M')}>*",
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
                            args=(str(contact_message_id),),
                        )
                    ),
                }
            ],
        },
    ]

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
        item=contact_message_obj,
    )


def send_registration_message(registration_id: UUID) -> MessageSlack | None:
    registration_obj = (
        Registration.objects.filter(id=registration_id, event__module__isnull=False)
        .select_related("entity", "entity__user", "event")
        .with_event_title()
        .first()
    )

    if not registration_obj:
        return None

    channel_id = getattr(
        settings,
        f"SLACK_{Module(registration_obj.event.module).name}_CHANNEL_ATTENDANCE",
    )

    if not channel_id:
        return None

    attendance_hours = getattr(
        settings, f"SLACK_{Module(registration_obj.event.module).name}_ATTENDANCE_TIME"
    )

    if attendance_hours is None or not (
        registration_obj.event.time_from - timezone.timedelta(hours=attendance_hours)
        <= timezone.localtime()
        <= registration_obj.event.time_to
    ):
        return None

    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{_('A registration for an upcoming event has just changed!')}\n*<{full_url(
                        path="admin/attendance",
                        module=registration_obj.event.module,
                    )}|{registration_obj.event_title_locale} — {timezone.localtime(registration_obj.event.time_from).strftime('%Y-%m-%d %H:%M')}>*",
            },
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*User*\n{registration_obj.entity.full_name}",
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Status*\n{RegistrationStatus(registration_obj.status).name.capitalize()}",
                },
            ],
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": str(_("View attendance")),
                        "emoji": True,
                    },
                    "url": full_url(
                        path="admin/attendance",
                        module=registration_obj.event.module,
                    ),
                }
            ],
        },
    ]

    message_id = post_message(
        channel_id=channel_id,
        blocks=blocks,
        module=registration_obj.event.module,
        unfurl_links=False,
        unfurl_media=False,
    )

    return MessageSlack.objects.create(
        channel_id=channel_id,
        message_id=message_id,
        type=MessageSlackType.REGISTRATION_UPDATED,
        module=registration_obj.event.module,
        locale=translation.get_language(),
        blocks=blocks,
        item=registration_obj,
    )


def send_user_message(user_id: UUID, module: Module) -> MessageSlack | None:
    user_obj = (
        User.objects.filter(id=user_id)
        .select_related("entity")
        .with_family_name()
        .with_consents(consent_types=[ConsentType.MEDIA], module=module)
        .first()
    )

    if not user_obj:
        return None

    channel_id = getattr(
        settings,
        f"SLACK_{Module(module).name}_CHANNEL_USERS",
    )

    if not channel_id:
        return None

    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{_('A new user just registered!')}\n*<{full_url(
                        path="admin/user",
                        module=module,
                    )}|{user_obj.name} — {timezone.localtime(user_obj.created_at).strftime('%Y-%m-%d %H:%M')}>*",
            },
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Name*\n{user_obj.name}",
                },
                *(
                    [
                        {
                            "type": "mrkdwn",
                            "text": f"*Phone*\n{format_phone(user_obj.phone)}",
                        }
                    ]
                    if user_obj.phone and user_obj.can_manage
                    else []
                ),
                *(
                    [
                        {
                            "type": "mrkdwn",
                            "text": f"*Family*\n{user_obj.family_name}",
                        }
                    ]
                    if not user_obj.is_adult and user_obj.family_name
                    else []
                ),
                *(
                    [
                        {
                            "type": "mrkdwn",
                            "text": f"*Age*\n{user_obj.age}",
                        }
                    ]
                    if not user_obj.is_adult and user_obj.age is not None
                    else []
                ),
                *(
                    [
                        {
                            "type": "mrkdwn",
                            "text": f"*Consent media*\n{'Yes' if getattr(user_obj, f'has_active_consent_{Module(module).name.lower()}_{ConsentType.MEDIA.name.lower()}') else 'No'}",
                        }
                    ]
                    if not user_obj.is_adult
                    else []
                ),
            ],
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": str(_("View user")),
                        "emoji": True,
                    },
                    "url": full_url(
                        path="admin/user",
                        module=module,
                    ),
                }
            ],
        },
    ]

    message_id = post_message(
        channel_id=channel_id,
        blocks=blocks,
        module=module,
        unfurl_links=False,
        unfurl_media=False,
    )

    return MessageSlack.objects.create(
        channel_id=channel_id,
        message_id=message_id,
        type=MessageSlackType.REGISTRATION_UPDATED,
        module=module,
        locale=translation.get_language(),
        blocks=blocks,
        item=user_obj,
    )
