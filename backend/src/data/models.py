from django.db import models
from django.db.models import JSONField
from django.utils import translation

from comunicat.db.mixins import StandardModel, Timestamps

from comunicat.utils.models import language_field_default
from data.managers import CountryQuerySet, RegionQuerySet, ZoneQuerySet


class Zone(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    code = models.CharField(unique=True, max_length=255)

    objects = ZoneQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]


class Country(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    code = models.CharField(unique=True, max_length=255)

    zone = models.ForeignKey(
        Zone, related_name="countries", blank=True, null=True, on_delete=models.CASCADE
    )

    is_starred = models.BooleanField(default=False)

    objects = CountryQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    class Meta:
        verbose_name = "country"
        verbose_name_plural = "countries"


class Region(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    code = models.CharField(max_length=255)

    country = models.ForeignKey(
        Country, related_name="regions", on_delete=models.CASCADE
    )

    objects = RegionQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    class Meta:
        unique_together = ("country", "code")
