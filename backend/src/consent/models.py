from django.core.exceptions import ValidationError
from django.db import models
from comunicat.db.mixins import Timestamps, StandardModel
from consent.enums import ConsentType

from django.utils.translation import gettext_lazy as _


class EntityConsent(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity", related_name="consents", on_delete=models.CASCADE
    )
    type = models.PositiveSmallIntegerField(
        choices=((ct.value, ct.name) for ct in ConsentType),
    )

    newsletter = models.ForeignKey(
        "notify.Newsletter",
        blank=True,
        null=True,
        related_name="consents",
        on_delete=models.CASCADE,
    )

    deleted_at = models.DateTimeField(blank=True, null=True)

    def clean(self):
        validation_errors = {}
        if self.type == ConsentType.NEWSLETTER and not self.newsletter:
            validation_errors["newsletter"] = _(
                "The newsletter is mandatory for newsletter consents."
            )

        if validation_errors:
            raise ValidationError(validation_errors)

    def __str__(self) -> str:
        return f"{str(self.entity)} - {ConsentType(self.type).name}"
