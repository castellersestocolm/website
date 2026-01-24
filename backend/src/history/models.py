from django.db.models import JSONField
from django.utils import translation

from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models

from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from history.managers import HistoryEventQuerySet


class HistoryEvent(StandardModel, Timestamps):
    title = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)
    date = models.DateField()

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    icon = models.CharField(max_length=255, blank=True, null=True)

    objects = HistoryEventQuerySet.as_manager()

    def __str__(self) -> str:
        return (
            self.title.get(translation.get_language()) or list(self.title.values())[0]
        )
