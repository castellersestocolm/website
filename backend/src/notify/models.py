from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import JSONField
from django.utils import translation
from django.utils.translation import gettext_lazy as _

from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from notify.enums import (
    ContactMessageStatus,
    ContactMessageType,
    EmailStatus,
    EmailType,
    MessageSlackType,
    NewsletterType,
)
from notify.managers import EmailTemplateQuerySet, NewsletterQuerySet


class EmailTemplate(StandardModel, Timestamps):
    subject = JSONField(default=language_field_default)
    body = JSONField(default=language_field_default)
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    button_text = JSONField(default=language_field_default)
    button_url = JSONField(default=language_field_default)

    objects = EmailTemplateQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{Module(self.module).name} - {
        self.subject.get(translation.get_language())
        or list(self.subject.values())[0]
        }"


class Email(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity",
        related_name="emails",
        on_delete=models.CASCADE,
    )
    template = models.ForeignKey(
        EmailTemplate,
        null=True,
        blank=True,
        related_name="emails",
        on_delete=models.SET_NULL,
    )
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EmailType),
        default=EmailType.GENERAL,
    )
    status = models.PositiveSmallIntegerField(
        choices=((es.value, es.name) for es in EmailStatus),
        default=EmailStatus.DRAFT,
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    locale = models.CharField(max_length=5)
    subject = models.CharField(max_length=255)
    context = JSONField(default=dict)

    def __str__(self) -> str:
        return f"{self.subject}{(' <' + self.entity.email or self.entity.user.email + '>') if self.entity.email or self.entity.user else ''}"


class MessageSlack(StandardModel, Timestamps):
    channel_id = models.CharField(max_length=255)
    message_id = models.CharField(max_length=255)
    type = models.PositiveSmallIntegerField(
        choices=((mst.value, mst.name) for mst in MessageSlackType),
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    locale = models.CharField(max_length=5)
    blocks = JSONField(default=dict)


class ContactMessage(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity",
        related_name="contact_messages",
        on_delete=models.CASCADE,
    )
    type = models.PositiveSmallIntegerField(
        choices=((cmt.value, cmt.name) for cmt in ContactMessageType),
        default=ContactMessageType.CONTACT,
    )
    status = models.PositiveSmallIntegerField(
        choices=((cms.value, cms.name) for cms in ContactMessageStatus),
        default=ContactMessageStatus.CREATED,
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    message = models.TextField(max_length=1000)
    context = JSONField(default=dict)


class Newsletter(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    type = models.PositiveSmallIntegerField(
        choices=((nt.value, nt.name) for nt in NewsletterType),
        default=NewsletterType.INTERNAL,
    )

    google_group = models.ForeignKey(
        "user.GoogleGroup",
        related_name="newsletters",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    objects = NewsletterQuerySet.as_manager()

    def clean(self):
        validation_errors = {}
        if self.type == NewsletterType.GOOGLE and not self.google_group:
            validation_errors["google_group"] = _(
                "The Google group is mandatory for Google newsletters."
            )

        if validation_errors:
            raise ValidationError(validation_errors)

    def __str__(self) -> str:
        return f"{Module(self.module).name} - {
        self.name.get(translation.get_language())
        or list(self.name.values())[0]
        }"
