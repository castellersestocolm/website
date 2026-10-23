from django.core.validators import RegexValidator
from django.db import models

from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from theme.enums import ColourType, IconType


class Icon(StandardModel, Timestamps):
    code = models.CharField(max_length=255)

    type = models.PositiveSmallIntegerField(
        choices=((it.value, it.name) for it in IconType),
    )

    def __str__(self) -> str:
        return f"{self.code} [{IconType(self.type).name}]"

    class Meta:
        unique_together = ("code", "type")


class Colour(StandardModel, Timestamps):
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    type = models.PositiveSmallIntegerField(
        choices=((ct.value, ct.name) for ct in ColourType),
        default=ColourType.PALETTE_PRIMARY_MAIN,
    )
    code = models.CharField(
        max_length=255,
        validators=[RegexValidator(regex=r"^#[0-9a-zA-Z]{6}$")],
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{ColourType(self.type).name} [{Module(self.module).name}]"

    class Meta:
        unique_together = ("module", "type", "code")


class Theme(StandardModel, Timestamps):
    name = models.CharField(max_length=255)

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    icon = models.ForeignKey(Icon, related_name="themes", on_delete=models.CASCADE)

    colour_primary = models.ForeignKey(
        Colour,
        related_name="themes_primary",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    colour_secondary = models.ForeignKey(
        Colour,
        related_name="themes_secondary",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )
    colour_icon = models.ForeignKey(
        Colour,
        related_name="themes_icon",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{self.name} [{Module(self.module).name}]"
