import re

from django.db import models
from django.db.models import JSONField
from django.utils import translation
from unidecode import unidecode
from versatileimagefield.fields import VersatileImageField

from comunicat.db.mixins import Timestamps, StandardModel
from comunicat.enums import Module
from comunicat.utils.models import language_field_default


class Release(StandardModel, Timestamps):
    title = JSONField(default=language_field_default)
    subtitle = JSONField(default=language_field_default)

    slug = models.CharField(unique=True, max_length=255, blank=True)

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    date = models.DateTimeField()

    content = JSONField(default=language_field_default)

    def __str__(self) -> str:
        return f"{Module(self.module).name} - {self.title.get(translation.get_language()) or list(self.title.values())[0]}"

    def clean(self):
        if not self.slug:
            self.slug = re.sub(
                r"[^a-z0-9\-]",
                "",
                unidecode(
                    self.title.get(translation.get_language())
                    or list(self.title.values())[0]
                )
                .lower()
                .replace(" ", "-"),
            )[:255]


class ReleaseImage(StandardModel, Timestamps):
    product = models.ForeignKey(
        "Release",
        related_name="images",
        on_delete=models.CASCADE,
    )

    picture = VersatileImageField("Image", upload_to="media/release/image/picture/")
    footnote = models.CharField(blank=True, null=True, max_length=255)

    order = models.PositiveSmallIntegerField(default=0)

    def __str__(self) -> str:
        return f"{str(self.product)} <{self.picture.name}>"
