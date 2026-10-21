from django.core.validators import RegexValidator
from django.db import models

from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from theme.enums import IconType


class Icon(StandardModel, Timestamps):
    code = models.CharField(max_length=255)

    type = models.PositiveSmallIntegerField(
        choices=((it.value, it.name) for it in IconType),
    )

    def __str__(self) -> str:
        return f"{self.code} [{IconType(self.type).name}]"

    class Meta:
        unique_together = ("code", "type")


class Theme(StandardModel, Timestamps):
    name = models.CharField(max_length=255)

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    icon = models.ForeignKey(Icon, related_name="themes", on_delete=models.CASCADE)

    colour_primary = models.CharField(
        max_length=255, validators=[RegexValidator(regex=r"^#[0-9a-zA-Z]{6}$")]
    )
    colour_secondary = models.CharField(
        max_length=255,
        validators=[RegexValidator(regex=r"^#[0-9a-zA-Z]{6}$")],
        blank=True,
        null=True,
    )
    colour_icon = models.CharField(
        max_length=255,
        validators=[RegexValidator(regex=r"^#[0-9a-zA-Z]{6}$")],
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{self.name} [{Module(self.module).name}]"
