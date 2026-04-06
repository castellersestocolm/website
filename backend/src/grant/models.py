from django.core.validators import MinValueValidator, MaxValueValidator

from comunicat.db.mixins import StandardModel, Timestamps

from django.db import models


class Grant(StandardModel, Timestamps):
    name = models.CharField(max_length=255)

    date_from = models.DateField()
    date_to = models.DateField()

    url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} <{self.date_from.strftime('%Y-%m-%d')} - {self.date_to.strftime('%Y-%m-%d')}>"


class GrantArea(StandardModel, Timestamps):
    grant = models.ForeignKey(
        "Grant",
        related_name="areas",
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)
    number = models.PositiveSmallIntegerField(default=1, unique=True)

    percentage = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    def __str__(self):
        return f"{self.grant.name} - {self.name} <{self.grant.date_from.strftime('%Y-%m-%d')} - {self.grant.date_to.strftime('%Y-%m-%d')}>"


class GrantAreaAccount(StandardModel, Timestamps):
    area = models.ForeignKey(
        "GrantArea",
        related_name="accounts",
        on_delete=models.CASCADE,
    )
    account = models.ForeignKey(
        "payment.Account",
        related_name="areas",
        on_delete=models.CASCADE,
    )
