from django.db import models
from django.db.models import JSONField
from django.utils import translation

from comunicat.db.mixins import StandardModel, Timestamps
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

    icon = models.ForeignKey(
        "theme.Icon",
        related_name="history_events",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    objects = HistoryEventQuerySet.as_manager()

    def __str__(self) -> str:
        return (
            self.title.get(translation.get_language()) or list(self.title.values())[0]
        )
