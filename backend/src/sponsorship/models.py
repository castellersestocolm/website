import re
import unicodedata

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import JSONField
from django.utils import translation
from django.utils.functional import cached_property
from django.utils.translation import gettext_lazy as _
from djmoney.models.fields import MoneyField

from comunicat.consts import LOCALE_BY_MODULE
from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from sponsorship.enums import (
    EntityTierStatus,
    RewardType,
    SponsorshipStatus,
    SponsorshipType,
)
from sponsorship.managers import (
    EntityTierQuerySet,
    EntityTierRewardQuerySet,
    RewardQuerySet,
    SponsorshipQuerySet,
    TierQuerySet,
)


class Sponsorship(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)

    code = models.CharField(max_length=255, blank=True)

    type = models.PositiveSmallIntegerField(
        choices=((st.value, st.name) for st in SponsorshipType),
        default=SponsorshipType.GENERAL,
    )
    status = models.PositiveSmallIntegerField(
        choices=((ss.value, ss.name) for ss in SponsorshipStatus),
        default=SponsorshipStatus.DRAFT,
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        null=True,
        blank=True,
    )

    date_from = models.DateField(blank=True, null=True)
    date_to = models.DateField(blank=True, null=True)

    event = models.ForeignKey(
        "event.Event",
        related_name="sponsorships",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    objects = SponsorshipQuerySet.as_manager()

    @cached_property
    def name_locale(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    def __str__(self) -> str:
        return self.name_locale

    def clean(self):
        validation_errors = {}

        if self.type == SponsorshipType.EVENT and not self.event:
            validation_errors["event"] = _("The event is mandatory for type EVENT.")

        if validation_errors:
            raise ValidationError(validation_errors)

    def save(self, *args, **kwargs):
        if not self.code:
            locale = (
                LOCALE_BY_MODULE[self.module] if self.module else settings.LANGUAGE_CODE
            )
            code_normalized = unicodedata.normalize(
                "NFKD",
                re.sub(
                    r"[^\w\-]",
                    "",
                    self.name.get(locale).replace(" ", "-"),
                ),
            ).lower()
            self.code = "".join(
                [c for c in code_normalized if unicodedata.category(c) != "Mn"]
            )

        super().save(*args, **kwargs)


class Tier(StandardModel, Timestamps):
    sponsorship = models.ForeignKey(
        Sponsorship, related_name="tiers", on_delete=models.CASCADE
    )

    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)

    length_days = models.PositiveSmallIntegerField(default=0)
    length_months = models.PositiveSmallIntegerField(default=0)
    length_years = models.PositiveSmallIntegerField(default=0)

    order = models.PositiveSmallIntegerField(default=0)

    theme = models.ForeignKey(
        "theme.Theme",
        null=True,
        blank=True,
        related_name="tiers",
        on_delete=models.SET_NULL,
    )

    objects = TierQuerySet.as_manager()

    @cached_property
    def name_locale(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    def __str__(self) -> str:
        return f"{self.name_locale} - {self.sponsorship}"


class TierPrice(StandardModel, Timestamps):
    tier = models.ForeignKey(Tier, related_name="prices", on_delete=models.PROTECT)

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        null=True,
        blank=True,
    )

    amount = MoneyField(max_digits=7, decimal_places=2, default_currency="SEK")

    def __str__(self) -> str:
        if self.module:
            return f"{Module(self.module).name} - {self.tier} - {self.amount}"

        return f"{self.tier} - {self.amount}"

    class Meta:
        unique_together = ("tier", "module")


class Reward(StandardModel, Timestamps):
    type = models.PositiveSmallIntegerField(
        choices=((rt.value, rt.name) for rt in RewardType),
        default=RewardType.GENERAL,
    )

    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)

    icon = models.ForeignKey(
        "theme.Icon",
        related_name="awards",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    product = models.ForeignKey(
        "product.Product",
        related_name="rewards",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
    )
    newsletter = models.ForeignKey(
        "notify.Newsletter",
        related_name="rewards",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
    )

    objects = RewardQuerySet.as_manager()

    @cached_property
    def name_locale(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    def __str__(self) -> str:
        if self.type == RewardType.PRODUCT and self.product:
            return self.product.name_locale
        elif self.type == RewardType.NEWSLETTER and self.newsletter:
            return self.newsletter.name_locale

        return self.name_locale

    def clean(self):
        validation_errors = {}

        if self.type == RewardType.PRODUCT and not self.product:
            validation_errors["product"] = _(
                "The product is mandatory for type PRODUCT."
            )
        elif self.type == RewardType.NEWSLETTER and not self.newsletter:
            validation_errors["newsletter"] = _(
                "The newsletter is mandatory for type NEWSLETTER."
            )

        if validation_errors:
            raise ValidationError(validation_errors)


class RewardGroup(StandardModel, Timestamps):
    tier = models.ForeignKey(
        Tier, related_name="reward_groups", on_delete=models.CASCADE
    )

    min_rewards = models.PositiveSmallIntegerField(default=1)
    max_rewards = models.PositiveSmallIntegerField(default=1)

    order = models.PositiveSmallIntegerField(default=0)

    rewards = models.ManyToManyField(Reward, related_name="reward_groups")


class EntityTier(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity", related_name="tiers", on_delete=models.CASCADE
    )

    tier = models.ForeignKey(Tier, related_name="tiers", on_delete=models.PROTECT)

    status = models.PositiveSmallIntegerField(
        choices=((ets.value, ets.name) for ets in EntityTierStatus),
        default=EntityTierStatus.REQUESTED,
    )

    date_from = models.DateField()
    date_to = models.DateField()

    price = models.ForeignKey(
        TierPrice,
        blank=True,
        null=True,
        related_name="entity_tiers",
        on_delete=models.PROTECT,
    )

    is_public = models.BooleanField(default=True)

    objects = EntityTierQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{str(self.entity)} - {self.tier}"


class EntityTierReward(StandardModel, Timestamps):
    entity_tier = models.ForeignKey(
        EntityTier, related_name="rewards", on_delete=models.CASCADE
    )

    reward = models.ForeignKey(
        Reward, related_name="entity_tier_rewards", on_delete=models.PROTECT
    )

    objects = EntityTierRewardQuerySet.as_manager()
