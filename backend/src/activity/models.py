from django.db import models
from django.db.models import JSONField
from django.utils import translation
from djmoney.models.fields import MoneyField

from activity.enums import ProgramType
from activity.managers import ProgramQuerySet, ProgramCourseQuerySet
from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from comunicat.utils.models import language_field_default


class Program(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    type = models.PositiveSmallIntegerField(
        choices=((pt.value, pt.name) for pt in ProgramType),
    )

    objects = ProgramQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]


# TODO: Define eligibility for when one can join after the start date
class ProgramCourse(StandardModel, Timestamps):
    program = models.ForeignKey(
        Program, related_name="courses", on_delete=models.PROTECT
    )

    date_from = models.DateField()
    date_to = models.DateField()

    signup_until = models.DateField(blank=True, null=True)

    objects = ProgramCourseQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{self.program} <{self.date_from.strftime('%Y-%m-%d')} - {self.date_to.strftime('%Y-%m-%d')}>"


class ProgramCoursePrice(StandardModel, Timestamps):
    course = models.ForeignKey(
        ProgramCourse, related_name="prices", on_delete=models.PROTECT
    )

    age_from = models.PositiveSmallIntegerField(blank=True, null=True)
    age_to = models.PositiveSmallIntegerField(blank=True, null=True)

    amount = MoneyField(
        max_digits=7, decimal_places=2, null=True, blank=True, default_currency="SEK"
    )

    def __str__(self) -> str:
        return f"{self.course} - {self.amount}"


class ProgramCourseRegistration(StandardModel, Timestamps):
    course = models.ForeignKey(
        ProgramCourse, related_name="registrations", on_delete=models.PROTECT
    )
    entity = models.ForeignKey(
        "payment.Entity", related_name="course_registrations", on_delete=models.PROTECT
    )
    price = models.ForeignKey(
        ProgramCoursePrice, related_name="registrations", on_delete=models.PROTECT
    )

    amount = MoneyField(
        max_digits=7, decimal_places=2, null=True, blank=True, default_currency="SEK"
    )
