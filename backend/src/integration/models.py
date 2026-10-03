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


class AppleWalletRegistration(StandardModel, Timestamps):
    device_library_id = models.CharField(max_length=255)
    pass_type_id = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=255)
    push_token = models.CharField(max_length=255)

    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("pass_type_id", "serial_number")
