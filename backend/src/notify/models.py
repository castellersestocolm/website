from django.db import models
from django.db.models import JSONField

from comunicat.db.mixins import Timestamps, StandardModel
from comunicat.enums import Module
from notify.enums import EmailType


class Email(StandardModel, Timestamps):
    user = models.ForeignKey(
        "user.User",
        null=True,
        blank=True,
        related_name="notification_emails",
        on_delete=models.CASCADE,
    )
    email = models.EmailField()
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EmailType),
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    locale = models.CharField(max_length=5)
    subject = models.CharField(max_length=255)
    context = JSONField(default=dict)
