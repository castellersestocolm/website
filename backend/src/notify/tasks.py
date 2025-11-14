from typing import Optional
from uuid import UUID

from celery import shared_task
from django.db.models import Prefetch

from django.template.loader import render_to_string
from django.utils import translation, timezone

from comunicat.enums import Module
from document.enums import DocumentStatus
from document.models import EmailAttachment
from event.models import EventModule, Registration
from membership.models import Membership, MembershipModule
from notify.api.email import send_email
from notify.api.slack.chat import send_order_message
from notify.consts import TEMPLATE_BY_MODULE, EMAIL_BY_MODULE, SETTINGS_BY_MODULE
from notify.enums import NotificationType, EmailType
from notify.models import Email
from order.models import Order, OrderProduct, OrderLog
from user.enums import FamilyMemberStatus
from user.models import User, FamilyMember

import membership.utils

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

    membership_obj = (
        Membership.objects.filter(users__id=user_obj.id if user_obj else user_id)
        .order_by("-date_to")
        .prefetch_related(
            Prefetch(
                "modules",
                MembershipModule.objects.order_by("module"),
                to_attr="all_modules",
            )
        )
        .first()
    )

    if membership_obj:
        modules = list(
            set(membership_obj.modules.values_list("module", flat=True))
            | set(settings.MODULE_ALL_MEMBERSHIP_REQUIRED)
        )

        if modules:
            # This works for now as we want to get the "specific" module for email branding
            module = sorted(modules)[-1]
        else:
            modules = [module]
    else:
        modules = [module]

    with translation.override(locale):
        context = {**SETTINGS_BY_MODULE[module], **(context or {})}
        context_full = {
            **context,
            "user_obj": user_obj,
            "email": email or user_obj.email,
        }

        if "event_ids" in context:
            from event.models import Event

            context_full["event_objs"] = list(
                sorted(
                    Event.objects.filter(id__in=context["event_ids"]).prefetch_related(
                        Prefetch(
                            "modules",
                            EventModule.objects.filter(module=module).order_by(
                                "module"
                            ),
                        )
                    ),
                    key=lambda e_obj: context["event_ids"].index(str(e_obj.id)),
                )
            )

        if "user_ids" in context:
            context_full["user_objs"] = list(
                sorted(
                    User.objects.filter(id__in=context["user_ids"]),
                    key=lambda u_obj: context["user_ids"].index(str(u_obj.id)),
                )
            )

        if "event_ids" in context and "user_ids" in context:
            from event.models import Registration

            context_full["registration_objs"] = list(
                Registration.objects.filter(
                    event_id__in=context["event_ids"],
                    user_id__in=context["user_ids"],
                )
            )

        if email_type in (
            EmailType.MEMBERSHIP_RENEW,
            EmailType.MEMBERSHIP_EXPIRED,
            EmailType.MEMBERSHIP_PAID,
            EmailType.MEMBERSHIP_CHECK,
        ):
            context_full["membership_obj"] = membership_obj

            if email_type != EmailType.MEMBERSHIP_PAID:
                user_ids = list(
                    {user_id}
                    | {
                        family_member_obj.user_id
                        # TODO: Review this as it could be wrong
                        for family_member_obj in FamilyMember.objects.filter(
                            family__members__user_id=user_id,
                            status=FamilyMemberStatus.ACTIVE,
                        )
                    }
                )

                membership_amount = sum(
                    [
                        membership.utils.get_membership_amount(
                            member_count=len(user_ids), module=current_module
                        )
                        for current_module in modules
                    ]
                )

                membership_length = membership.utils.get_membership_length(
                    member_count=len(user_ids)
                )
                membership_date_to = membership.utils.get_membership_date_to(
                    months=membership_length
                )

                context_full["membership_amount"] = membership_amount
                context_full["membership_length"] = membership_length
                context_full["membership_date_from"] = (
                    membership_obj.date_to if membership_obj else timezone.localdate()
                )
                context_full["membership_date_to"] = membership_date_to

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
            document__module=module,
        )
        .with_language_match()
        .select_related("document")
        .order_by("document__code", "language_match", "-document__version")
        .distinct("document__code")
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


@shared_task
def send_order_email(
    order_id: UUID,
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: Optional[dict] | None = None,
    locale: Optional[str] | None = None,
) -> None:
    order_obj = (
        Order.objects.filter(id=order_id)
        .select_related("entity", "delivery")
        .prefetch_related(
            Prefetch(
                "products",
                OrderProduct.objects.order_by(
                    "size__product__type", "size__order", "size__category", "size__size"
                )
                .select_related("size", "size__product", "line")
                .prefetch_related("size__product__images"),
            ),
            Prefetch("logs", OrderLog.objects.all().order_by("-created_at")),
        )
        .with_amount()
        .first()
    )

    entity = order_obj.entity
    user_obj = entity.user
    email = email or (user_obj.email if user_obj else entity.email)
    locale = (
        locale
        or (user_obj.preferred_language if user_obj else None)
        or settings.LANGUAGE_CODE
    )

    with translation.override(locale):
        context = {**SETTINGS_BY_MODULE[module], **(context or {})}
        context_full = {**context, "order_obj": order_obj, "user_obj": user_obj}

        template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL]["user"][
            email_type
        ]
        from_email = EMAIL_BY_MODULE[module]
        body = render_to_string(template["html"], context_full)
        subject = str(template["subject"])

    Email.objects.create(
        user=user_obj,
        email=email,
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
        to=email,
        reply_to=from_email,
        attachments=[],
        module=module,
    )


# TODO: Check here if registrations ever allow no-users (like entities)
@shared_task
def send_registration_email(
    registration_ids: list[UUID],
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: Optional[dict] | None = None,
    locale: Optional[str] | None = None,
) -> None:
    registration_objs = Registration.objects.filter(
        id__in=registration_ids
    ).select_related("user", "event", "line")

    for registration_obj in registration_objs:
        user_obj = registration_obj.user

        if not user_obj.can_manage:
            continue

        current_email = email or user_obj.email
        current_locale = (
            locale
            or (user_obj.preferred_language if user_obj else None)
            or settings.LANGUAGE_CODE
        )

        with translation.override(current_locale):
            context = {**SETTINGS_BY_MODULE[module], **(context or {})}
            context_full = {
                **context,
                "registration_objs": registration_objs,
                "user_obj": user_obj,
            }

            template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL]["user"][
                email_type
            ]
            from_email = EMAIL_BY_MODULE[module]
            body = render_to_string(template["html"], context_full)
            subject = str(template["subject"])

        Email.objects.create(
            user=user_obj,
            email=current_email,
            type=email_type,
            subject=subject,
            context=context,
            module=module,
            locale=current_locale,
        )

        send_email(
            subject=subject,
            body=body,
            from_email=from_email,
            to=current_email,
            reply_to=from_email,
            attachments=[],
            module=module,
        )


@shared_task
def send_order_message_slack(
    order_id: UUID,
) -> None:
    send_order_message(order_id=order_id)
