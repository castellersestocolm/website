import uuid

from django.db import models as db
from django.utils.translation import gettext as _


class StandardModel(db.Model):
    id = db.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class Timestamps(db.Model):
    created_at = db.DateTimeField(auto_now_add=True, verbose_name=_("created"))
    updated_at = db.DateTimeField(auto_now=True, verbose_name=_("updated"))

    class Meta:
        abstract = True
