from django.core.validators import MinLengthValidator
from django.db import models
from django.db.models import JSONField
from django.utils import translation
from django.utils.functional import cached_property

from comunicat.db.mixins import StandardModel, Timestamps

from comunicat.utils.models import language_field_default
from data.consts import COUNTRY_CODE_3_TO_CODE_2, COUNTRY_CODE_2_TO_CODE_3
from data.managers import CountryQuerySet, RegionQuerySet, ZoneQuerySet


class Zone(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    code = models.CharField(unique=True, max_length=255)

    objects = ZoneQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]


class Country(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    code = models.CharField(
        unique=True, max_length=3, validators=[MinLengthValidator(2)]
    )
    code_mapping = models.CharField(
        blank=True, null=True, max_length=3, validators=[MinLengthValidator(2)]
    )

    zone = models.ForeignKey(
        Zone, related_name="countries", blank=True, null=True, on_delete=models.CASCADE
    )

    is_starred = models.BooleanField(default=False)

    objects = CountryQuerySet.as_manager()

    @cached_property
    def code_2(self):
        code = self.code_mapping or self.code
        if len(code) == 3:
            return COUNTRY_CODE_3_TO_CODE_2[code]
        return code

    @cached_property
    def code_3(self):
        code = self.code_mapping or self.code
        if len(code) == 2:
            return COUNTRY_CODE_2_TO_CODE_3[code]
        return code

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
    country_code_mapping = models.CharField(
        blank=True, null=True, max_length=3, validators=[MinLengthValidator(2)]
    )

    objects = RegionQuerySet.as_manager()

    @cached_property
    def country_code_2(self):
        code = self.country_code_mapping or self.country.code
        if len(code) == 3:
            return COUNTRY_CODE_3_TO_CODE_2[code]
        return code

    @cached_property
    def country_code_3(self):
        code = self.country_code_mapping or self.country.code
        if len(code) == 2:
            return COUNTRY_CODE_2_TO_CODE_3[code]
        return code

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    class Meta:
        unique_together = ("country", "code")
