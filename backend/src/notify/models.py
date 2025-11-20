from django.db import models
from django.db.models import JSONField
from django.utils import translation

from comunicat.db.mixins import Timestamps, StandardModel
from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from notify.enums import EmailType, MessageSlackType, EmailStatus
from notify.managers import EmailTemplateQuerySet


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
        return f"{self.subject} <{self.entity.email or self.entity.user.email}>"


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
