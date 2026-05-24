from django.core.exceptions import ValidationError
from django.db import models, transaction
from comunicat.db.mixins import Timestamps, StandardModel
from consent.enums import ConsentType

from django.utils.translation import gettext_lazy as _

from notify.enums import NewsletterType


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

    google_group_user = models.ForeignKey(
        "user.GoogleGroupUser",
        blank=True,
        null=True,
        related_name="consents",
        on_delete=models.CASCADE,
    )

    deleted_at = models.DateTimeField(blank=True, null=True)

    def clean(self):
        validation_errors = {}
        if self.type == ConsentType.NEWSLETTER:
            if self.newsletter:
                if (
                    self.newsletter.type == NewsletterType.GOOGLE
                    and not self.deleted_at
                ):
                    import user.api.google_group

                    transaction.on_commit(
                        lambda: user.api.google_group.sync_from_consent(
                            entity_consent_id=self.id
                        )
                    )
            else:
                validation_errors["newsletter"] = _(
                    "The newsletter is mandatory for newsletter consents."
                )

        if validation_errors:
            raise ValidationError(validation_errors)

    def save(self, *args, **kwargs):
        if (
            self.type == ConsentType.NEWSLETTER
            and self.newsletter
            and self.newsletter.type == NewsletterType.GOOGLE
            and not self.deleted_at
        ):
            import user.api.google_group

            transaction.on_commit(
                lambda: user.api.google_group.sync_from_consent(
                    entity_consent_id=self.id
                )
            )

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{str(self.entity)} - {ConsentType(self.type).name}"
