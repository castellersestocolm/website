from uuid import UUID

from django.conf import settings
from django.db.models import Prefetch
from django.template.loader import render_to_string
from django.utils import translation, timezone

from activity.models import ProgramCourseRegistration
from comunicat.enums import Module
from document.enums import DocumentStatus
from document.models import EmailAttachment
from event.models import Registration, EventModule
from membership.models import Membership, MembershipModule
from notify.consts import (
    SETTINGS_BY_MODULE,
    TEMPLATE_BY_MODULE,
    EMAIL_BY_MODULE,
    EMAIL_RENDER_FUNCTION_PARAMS_BY_TYPE,
)
from notify.enums import NotificationType, EmailType, ContactMessageType
from notify.models import Email, ContactMessage

from django.utils.translation import gettext_lazy as _

import membership.utils
import payment.api.entity
from order.models import Order, OrderProduct, OrderLog
from payment.models import Entity, Payment, PaymentLine
from user.enums import FamilyMemberStatus
from user.models import User, FamilyMember


class EmailRender:
    subject: str
    body: str
    to_email: str
    from_email: str
    locale: str
    context: dict
    module: Module
    email_obj: Email | None
    entity_obj: Entity | None
    attachments: list | None

    def __init__(
        self,
        subject: str,
        body: str,
        to_email: str,
        from_email: str,
        locale: str,
        context: dict,
        module: Module,
        email_obj: Email | None = None,
        entity_obj: Entity | None = None,
        attachments: list | None = None,
    ):
        super().__init__()
        self.subject = subject
        self.body = body
        self.to_email = to_email
        self.from_email = from_email
        self.locale = locale
        self.context = context
        self.module = module
        self.email_obj = email_obj
        self.entity_obj = entity_obj
        self.attachments = attachments


def get_user_email_render(
    email_type: EmailType,
    module: Module,
    user_id: UUID | None = None,
    email: str | None = None,
    context: dict = None,
    locale: str | None = None,
) -> EmailRender | None:
    if user_id:
        user_obj = User.objects.get(id=user_id)
    elif email:
        user_obj = User.objects.filter_by_email(email=email).first()
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

    locale = locale or user_obj.preferred_language or settings.LANGUAGE_CODE

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
                    entity__user_id__in=context["user_ids"],
                )
            )

        if email_type in (
            EmailType.MEMBERSHIP_RENEW,
            EmailType.MEMBERSHIP_EXPIRED,
            EmailType.MEMBERSHIP_PAID,
            EmailType.MEMBERSHIP_CHECK,
        ):
            context_full["membership_obj"] = membership_obj

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

            if email_type in (EmailType.MEMBERSHIP_PAID, EmailType.MEMBERSHIP_CHECK):
                program_course_registration_objs = list(
                    ProgramCourseRegistration.objects.filter(
                        entity__user__id__in=user_ids,
                    )
                    .select_related("course", "course__program")
                    .with_course_program_name()
                    .order_by(
                        "course_program_name_locale",
                        "-amount",
                        "entity__user__firstname",
                        "entity__user__lastname",
                        "entity__firstname",
                        "entity__lastname",
                    )
                )
                context_full["program_course_registration_objs"] = (
                    program_course_registration_objs
                )
            elif email_type in (
                EmailType.MEMBERSHIP_RENEW,
                EmailType.MEMBERSHIP_EXPIRED,
            ):

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
                    membership_obj.date_from if membership_obj else timezone.localdate()
                )
                context_full["membership_date_to"] = (
                    membership_obj.date_to if membership_obj else membership_date_to
                )

        template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL][email_type]
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

    entity_obj = payment.api.entity.get_entity_by_key(email=email or user_obj.email)

    return EmailRender(
        subject=subject,
        body=body,
        to_email=email or user_obj.email,
        from_email=from_email,
        context=context,
        module=module,
        locale=locale,
        entity_obj=entity_obj,
        attachments=attachments,
    )


def get_order_email_render(
    order_id: UUID,
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: dict | None = None,
    locale: str | None = None,
) -> EmailRender:
    order_obj = (
        Order.objects.filter(id=order_id)
        .select_related("entity", "delivery", "delivery__provider")
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

    entity_obj = order_obj.entity
    user_obj = entity_obj.user
    email = email or (user_obj.email if user_obj else entity_obj.email)
    locale = (
        locale
        or (user_obj.preferred_language if user_obj else None)
        or (entity_obj.preferred_language if entity_obj else None)
        or settings.LANGUAGE_CODE
    )

    with translation.override(locale):
        context = {
            **SETTINGS_BY_MODULE[module],
            **(context or {}),
            "order_id": str(order_id),
        }
        context_full = {
            **context,
            "order_obj": order_obj,
            "entity_obj": entity_obj,
            "user_obj": user_obj,
        }

        template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL][email_type]
        from_email = EMAIL_BY_MODULE[module]
        body = render_to_string(template["html"], context_full)

        if email_type == EmailType.ORDER_PAID:
            subject = str(template["subject"]) % (f"#{order_obj.reference}",)
        else:
            subject = str(template["subject"])

    entity_obj = payment.api.entity.get_entity_by_key(email=email or user_obj.email)

    return EmailRender(
        subject=subject,
        body=body,
        to_email=email or user_obj.email,
        from_email=from_email,
        context=context,
        module=module,
        locale=locale,
        entity_obj=entity_obj,
    )


def get_payment_email_render(
    payment_id: UUID,
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: dict | None = None,
    locale: str | None = None,
) -> EmailRender:
    payment_obj = (
        Payment.objects.filter(id=payment_id)
        .select_related("entity", "transaction", "transaction__source")
        .prefetch_related(
            Prefetch(
                "lines", PaymentLine.objects.with_description().order_by("amount")
            ),
        )
        .with_amount()
        .first()
    )

    entity_obj = payment_obj.entity
    user_obj = entity_obj.user
    email = email or (user_obj.email if user_obj else entity_obj.email)
    locale = (
        locale
        or (user_obj.preferred_language if user_obj else None)
        or (entity_obj.preferred_language if entity_obj else None)
        or settings.LANGUAGE_CODE
    )

    with translation.override(locale):
        context = {
            **SETTINGS_BY_MODULE[module],
            **(context or {}),
            "payment_id": str(payment_id),
        }
        context_full = {
            **context,
            "payment_obj": payment_obj,
            "entity_obj": entity_obj,
            "user_obj": user_obj,
        }

        template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL][email_type]
        from_email = EMAIL_BY_MODULE[module]
        body = render_to_string(template["html"], context_full)

        if email_type == EmailType.PAYMENT_PAID and payment_obj.text:
            subject = str(template["subject"]) % (f"{payment_obj.text}",)
        else:
            subject = str(template["subject"]).rstrip(" — %s")

        attachments = []
        for i, payment_line_obj in enumerate(
            payment_obj.lines.filter(
                receipt__isnull=False,
            )
        ):
            attachments.append(
                (
                    f"{_('receipt')}-{i+1}.{payment_line_obj.receipt.file.name.split('.')[-1]}",
                    payment_line_obj.receipt.file.read(),
                )
            )

    entity_obj = payment.api.entity.get_entity_by_key(email=email or user_obj.email)

    return EmailRender(
        subject=subject,
        body=body,
        to_email=email or user_obj.email,
        from_email=from_email,
        context=context,
        module=module,
        locale=locale,
        entity_obj=entity_obj,
        attachments=attachments,
    )


def get_registration_email_renders(
    registration_ids: list[UUID],
    email_type: EmailType,
    module: Module,
    email: str | None = None,
    context: dict | None = None,
    locale: str | None = None,
) -> list[EmailRender]:
    registration_objs = list(
        Registration.objects.filter(id__in=registration_ids)
        .select_related("entity", "entity__user", "event", "line")
        .order_by(
            "-line__amount",
            "entity__user__firstname",
            "entity__user__lastname",
            "entity__firstname",
            "entity__lastname",
        )
    )

    # Registrations must belong to the same event
    assert (
        len({registration_obj.event_id for registration_obj in registration_objs}) == 1
    )

    email_renders = []

    for registration_i, registration_obj in enumerate(registration_objs):
        entity_obj = registration_obj.entity
        user_obj = entity_obj.user

        if user_obj and not user_obj.can_manage:
            continue

        current_email = email or user_obj.email if user_obj else entity_obj.email
        current_locale = (
            locale
            or (user_obj.preferred_language if user_obj else None)
            or (entity_obj.preferred_language if entity_obj else None)
            or settings.LANGUAGE_CODE
        )

        if not current_email:
            continue

        with translation.override(current_locale):
            context = {
                **SETTINGS_BY_MODULE[module],
                **(context or {}),
                "email_index": registration_i,
                "registration_ids": [
                    str(current_registration_id)
                    for current_registration_id in registration_ids
                ],
            }
            context_full = {
                **context,
                "event_obj": registration_obj.event,
                "registration_obj": registration_obj,
                "registration_objs": registration_objs,
                "entity_obj": entity_obj,
                "user_obj": user_obj,
            }

            template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL][email_type]
            from_email = EMAIL_BY_MODULE[module]
            body = render_to_string(template["html"], context_full)

            if email_type == EmailType.REGISTRATION_PAID:
                subject = str(template["subject"]) % (registration_obj.event.title,)
            else:
                subject = str(template["subject"])

        entity_obj = payment.api.entity.get_entity_by_key(email=current_email)

        email_renders.append(
            EmailRender(
                subject=subject,
                body=body,
                to_email=current_email,
                from_email=from_email,
                context=context,
                module=module,
                locale=current_locale,
                entity_obj=entity_obj,
            )
        )

    return email_renders


def get_generic_email_render(email_id: UUID) -> EmailRender:
    email_obj = Email.objects.filter(id=email_id).select_related("entity").first()

    entity_obj = email_obj.entity
    user_obj = entity_obj.user
    email = user_obj.email if user_obj else entity_obj.email
    locale = (
        email_obj.locale
        or (user_obj.preferred_language if user_obj else None)
        or (entity_obj.preferred_language if entity_obj else None)
        or settings.LANGUAGE_CODE
    )

    with translation.override(locale):
        context = SETTINGS_BY_MODULE[email_obj.module]
        context_full = {
            **context,
            **email_obj.context,
            "entity_obj": entity_obj,
            "user_obj": user_obj,
        }

        template = TEMPLATE_BY_MODULE[email_obj.module][NotificationType.EMAIL][
            email_obj.type
        ]
        from_email = EMAIL_BY_MODULE[email_obj.module]
        body = render_to_string(template["html"], context_full)

    return EmailRender(
        subject=email_obj.subject,
        body=body,
        email_obj=email_obj,
        to_email=email,
        from_email=from_email,
        locale=locale,
        context=context,
        module=email_obj.module,
    )


def get_contact_message_email_render(
    contact_message_id: UUID,
) -> EmailRender:
    contact_message_obj = (
        ContactMessage.objects.filter(id=contact_message_id)
        .select_related("entity")
        .first()
    )

    entity_obj = contact_message_obj.entity
    user_obj = entity_obj.user
    email = user_obj.email if user_obj else entity_obj.email
    locale = (
        (user_obj.preferred_language if user_obj else None)
        or (entity_obj.preferred_language if entity_obj else None)
        or settings.LANGUAGE_CODE
    )
    module = contact_message_obj.module

    with translation.override(locale):
        context = {
            **SETTINGS_BY_MODULE[module],
            "contact_message_id": str(contact_message_id),
        }
        context_full = {
            **context,
            "contact_message_obj": contact_message_obj,
            "entity_obj": entity_obj,
            "user_obj": user_obj,
        }

        template = TEMPLATE_BY_MODULE[module][NotificationType.EMAIL][
            EmailType.CONTACT_MESSAGE
        ]
        from_email = EMAIL_BY_MODULE[module]
        body = render_to_string(template["html"], context_full)
        subject = str(template["subject"]) % (
            ContactMessageType(contact_message_obj.type)
            .name.capitalize()
            .replace("_", " "),
        )

    entity_obj = payment.api.entity.get_entity_by_key(email=email or user_obj.email)

    return EmailRender(
        subject=subject,
        body=body,
        to_email=email or user_obj.email,
        from_email=from_email,
        context=context,
        module=module,
        locale=locale,
        entity_obj=entity_obj,
    )


def get_email_render(email_id: UUID) -> EmailRender | None:
    email_obj = Email.objects.filter(id=email_id).select_related("entity").first()

    if email_obj.type == EmailType.GENERAL:
        return get_generic_email_render(email_id=email_id)

    function, params = EMAIL_RENDER_FUNCTION_PARAMS_BY_TYPE[email_obj.type]

    if not all([param in email_obj.context for param in params]):
        return None

    email_render = globals()[function](
        **{param: email_obj.context.get(param) for param in params},
        email_type=email_obj.type,
        module=email_obj.module,
        email=email_obj.entity.email,
        context=email_obj.context,
        locale=email_obj.locale,
    )

    if isinstance(email_render, list):
        return email_render[email_obj.context.get("email_index", 0)]

    return email_render
