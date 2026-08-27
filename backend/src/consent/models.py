from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _

from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from consent.enums import ConsentType
from consent.managers import EntityConsentQuerySet
from notify.enums import NewsletterType


class EntityConsent(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity", related_name="consents", on_delete=models.CASCADE
    )
    type = models.PositiveSmallIntegerField(
        choices=((ct.value, ct.name) for ct in ConsentType),
    )

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    newsletter = models.ForeignKey(
        "notify.Newsletter",
        blank=True,
        null=True,
        related_name="consents",
        on_delete=models.CASCADE,
    )

    google_group_user = models.ForeignKey(
        "user.GoogleGroupUser",
        blank=True,
        null=True,
        related_name="consents",
        on_delete=models.CASCADE,
    )

    deleted_at = models.DateTimeField(blank=True, null=True)

    objects = EntityConsentQuerySet.as_manager()

    def clean(self):
        validation_errors = {}
        if self.type == ConsentType.NEWSLETTER:
            if not self.newsletter:
                validation_errors["newsletter"] = _(
                    "The newsletter is mandatory for newsletter consents."
                )

        if validation_errors:
            raise ValidationError(validation_errors)

    def save(self, sync: bool = True, *args, **kwargs):
        if (
            sync
            and self.type == ConsentType.NEWSLETTER
            and self.newsletter
            and self.newsletter.type == NewsletterType.GOOGLE
        ):
            import user.tasks

            transaction.on_commit(
                lambda: user.tasks.sync_from_consent(entity_consent_id=self.id)
            )

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{str(self.entity)} - {ConsentType(self.type).name}"
