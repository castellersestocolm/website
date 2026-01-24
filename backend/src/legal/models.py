from django.core.exceptions import ValidationError
from django.db.models import JSONField
from django.utils import translation
from versatileimagefield.fields import VersatileImageField

from django.utils.translation import gettext_lazy as _

from comunicat.consts import SHORT_NAME_BY_MODULE
from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models

from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from legal.enums import TeamType
from legal.managers import RoleQuerySet, TeamQuerySet


class Group(StandardModel, Timestamps):
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    date_from = models.DateField()
    date_to = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{SHORT_NAME_BY_MODULE[self.module]} - {self.date_from.year}"


class Team(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    type = models.PositiveSmallIntegerField(
        choices=((tt.value, tt.name) for tt in TeamType), default=TeamType.BOARD
    )

    group = models.ForeignKey("Group", related_name="teams", on_delete=models.CASCADE)

    objects = TeamQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{self.group} - {self.name.get(translation.get_language()) or list(self.name.values())[0]}"


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

    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)

    picture = VersatileImageField("Image", upload_to="legal/member/picture/")

    def clean(self):
        validation_errors = {}
        if self.date_from and (
            self.date_from < self.team.group.date_from
            or (self.team.group.date_to and self.date_from > self.team.group.date_to)
        ):
            validation_errors["date_from"] = _(
                "The from date must be within the team's dates."
            )
        if self.date_to and (
            self.date_to < self.team.group.date_from
            or (self.team.group.date_to and self.date_to > self.team.group.date_to)
        ):
            validation_errors["date_to"] = _(
                "The to date must be within the team's dates."
            )

        if validation_errors:
            raise ValidationError(validation_errors)


class Bylaws(StandardModel, Timestamps):
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    date = models.DateField()

    content = JSONField(default=language_field_default)

    class Meta:
        verbose_name = "bylaws"
        verbose_name_plural = "bylaws"
