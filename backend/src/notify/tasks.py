from uuid import UUID

from celery import shared_task

from comunicat.enums import Module
from notify.api.email import send_email
from notify.api.slack.chat import send_order_message, send_contact_message
from notify.api.template import (
    get_generic_email_render,
    get_registration_email_renders,
    get_order_email_render,
    get_user_email_render,
    get_contact_message_email_render,
)
from notify.enums import EmailType, EmailStatus
from notify.models import Email

from django.conf import settings


@shared_task
def send_user_email(
    email_type: EmailType,
    module: Module,
    user_id: UUID | None = None,
    email: str | None = None,
    context: dict = None,
    locale: str = settings.LANGUAGE_CODE,
) -> None:
    email_render = get_user_email_render(
        email_type=email_type,
        module=module,
        user_id=user_id,
        email=email,
        context=context,
        locale=locale,
    )

    email_obj = Email.objects.create(
        entity=email_render.entity_obj,
        type=email_type,
        subject=email_render.subject,
        context=email_render.context,
        module=module,
        locale=email_render.locale,
        status=EmailStatus.SENT,
    )

    send_email(
        subject=email_render.subject,
        body=email_render.body,
        from_email=email_render.from_email,
        to=email_render.to_email,
        reply_to=email_render.from_email,
        attachments=email_render.attachments,
        module=module,
    )

    return email_obj


# TODO: Include cases for partial payment with status on each line
@shared_task
def send_order_email(
    order_id: UUID,
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: dict | None = None,
    locale: str | None = None,
) -> None:
    email_render = get_order_email_render(
        order_id=order_id,
        email_type=email_type,
        module=module,
        email=email,
        context=context,
        locale=locale,
    )

    email_obj = Email.objects.create(
        entity=email_render.entity_obj,
        type=email_type,
        subject=email_render.subject,
        context=email_render.context,
        module=module,
        locale=email_render.locale,
        status=EmailStatus.SENT,
    )

    send_email(
        subject=email_render.subject,
        body=email_render.body,
        from_email=email_render.from_email,
        to=email_render.to_email,
        reply_to=email_render.from_email,
        attachments=[],
        module=module,
    )

    return email_obj


# TODO: Check here if registrations ever allow no-users (like entities)
@shared_task
def send_registration_email(
    registration_ids: list[UUID],
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: dict | None = None,
    locale: str | None = None,
) -> list[Email]:
    email_renders = get_registration_email_renders(
        registration_ids=registration_ids,
        email_type=email_type,
        module=module,
        email=email,
        context=context,
        locale=locale,
    )
    email_objs = []

    for email_render in email_renders:
        email_objs.append(
            Email.objects.create(
                entity=email_render.entity_obj,
                type=email_type,
                subject=email_render.subject,
                context=email_render.context,
                module=module,
                locale=email_render.locale,
                status=EmailStatus.SENT,
            )
        )

        send_email(
            subject=email_render.subject,
            body=email_render.body,
            from_email=email_render.from_email,
            to=email_render.to_email,
            reply_to=email_render.from_email,
            attachments=[],
            module=module,
        )

    return email_objs


@shared_task
def send_generic_email(
    email_id: UUID,
) -> Email:
    email_render = get_generic_email_render(email_id=email_id)

    email_obj = email_render.email_obj

    email_obj.status = EmailStatus.SENT
    email_obj.save(update_fields=("status",))

    send_email(
        subject=email_render.subject,
        body=email_render.body,
        from_email=email_render.from_email,
        to=email_render.to_email,
        reply_to=email_render.from_email,
        attachments=[],
        module=email_obj.module,
    )

    return email_obj


# TODO: Send also an email to the person that filled in the contact form
@shared_task
def send_contact_message_email(
    contact_message_id: UUID,
) -> Email:
    email_render = get_contact_message_email_render(
        contact_message_id=contact_message_id
    )

    email_obj = Email.objects.create(
        entity=email_render.entity_obj,
        type=EmailType.CONTACT_MESSAGE,
        subject=email_render.subject,
        context=email_render.context,
        module=email_render.module,
        locale=email_render.locale,
        status=EmailStatus.SENT,
    )

    send_email(
        subject=email_render.subject,
        body=email_render.body,
        from_email=email_render.from_email,
        to=email_render.from_email,
        reply_to=email_render.to_email,
        attachments=[],
        module=email_render.module,
    )

    return email_obj


@shared_task
def send_order_message_slack(
    order_id: UUID,
) -> None:
    send_order_message(order_id=order_id)


@shared_task
def send_contact_message_slack(
    contact_message_id: UUID,
) -> None:
    send_contact_message(contact_message_id=contact_message_id)
