from django.db.models import JSONField
from django.utils import translation
from versatileimagefield.fields import VersatileImageField

from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models

from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from legal.enums import TeamType
from legal.managers import RoleQuerySet


class Team(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    type = models.PositiveSmallIntegerField(
        choices=((tt.value, tt.name) for tt in TeamType), default=TeamType.BOARD
    )
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    date_from = models.DateField()
    date_to = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{Module(self.module).name} - {self.name.get(translation.get_language()) or list(self.name.values())[0]}"


class Role(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    name_plural = JSONField(default=language_field_default)

    order = models.PositiveSmallIntegerField()

    objects = RoleQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]


class Member(StandardModel, Timestamps):
    user = models.ForeignKey(
        "user.User", related_name="members", on_delete=models.CASCADE
    )
    team = models.ForeignKey("Team", related_name="members", on_delete=models.CASCADE)
    role = models.ForeignKey("Role", related_name="members", on_delete=models.CASCADE)

    picture = VersatileImageField("Image", upload_to="legal/member/picture/")


class Bylaws(StandardModel, Timestamps):
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    date = models.DateField()

    content = JSONField(default=language_field_default)

    class Meta:
        verbose_name = "bylaws"
        verbose_name_plural = "bylaws"
