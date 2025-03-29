from typing import Optional
from uuid import UUID

from celery import shared_task
from django.core.files.base import ContentFile

from django.template.loader import render_to_string
from django.utils import translation

from comunicat.enums import Module
from document.enums import DocumentStatus
from document.models import EmailAttachment
from notify.api.email import send_email
from notify.consts import TEMPLATE_BY_MODULE, EMAIL_BY_MODULE, SETTINGS_BY_MODULE
from notify.enums import NotificationType, EmailType
from notify.models import Email
from user.models import User

from django.conf import settings


@shared_task
def send_user_email(
    email_type: EmailType,
    module: Module,
    user_id: UUID | None = None,
    email: str | None = None,
    context: Optional[dict] = None,
    locale: Optional[str] = settings.LANGUAGE_CODE,
) -> None:
    if user_id:
        user_obj = User.objects.get(id=user_id)
    elif email:
        user_obj = User.objects.filter(email=email).first()
    else:
        return None

    with translation.override(locale):
        context = {**SETTINGS_BY_MODULE[module], **(context or {})}
        context_full = {**context, "user_obj": user_obj}
        template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL]["user"][
            email_type
        ]
        from_email = EMAIL_BY_MODULE[module]
        body = render_to_string(template["html"], context_full)
        subject = str(template["subject"])

    attachments = []
    for email_attachment_obj in (
        EmailAttachment.objects.filter(
            type=email_type,
            document__status=DocumentStatus.PUBLISHED,
            document__language=locale,
        )
        .select_related("document")
        .order_by("document__code", "document__version")
        .distinct("document__code", "document__version")
    ):
        attachments.append(
            (
                f"{email_attachment_obj.document.name}.{email_attachment_obj.document.file.name.split('.')[-1]}",
                email_attachment_obj.document.file.read(),
            )
        )

    Email.objects.create(
        user=user_obj,
        email=email or user_obj.email,
        type=email_type,
        subject=subject,
        context=context,
        module=module,
        locale=locale,
    )

    send_email(
        subject=subject,
        body=body,
        from_email=from_email,
        to=email or user_obj.email,
        reply_to=from_email,
        attachments=attachments,
        module=module,
    )
