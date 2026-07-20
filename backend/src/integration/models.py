from django.db import models
from django.db.models import JSONField

from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module


class GoogleIntegration(StandardModel, Timestamps):
    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        unique=True,
    )
    authorized_user_info = JSONField(default=dict)

    def __str__(self) -> str:
        return Module(self.module).name
