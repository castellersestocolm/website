import os
from io import BytesIO

import fitz
from django.core.files.images import ImageFile

from django.core.validators import FileExtensionValidator
from versatileimagefield.fields import VersatileImageField

from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models

from comunicat.enums import Module
from comunicat.storage import signed_storage
from document.enums import DocumentType, DocumentStatus
from notify.enums import EmailType


def get_document_file_name(instance, filename):
    return os.path.join(
        "document/document/file/", f"{instance.id}.{filename.split('.')[-1]}"
    )


def get_document_preview_name(instance, filename):
    return os.path.join(
        "document/document/preview/", f"{instance.id}.{filename.split('.')[-1]}"
    )


class Document(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    language = models.CharField(max_length=255)

    version = models.PositiveIntegerField(default=0)

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )

    type = models.PositiveSmallIntegerField(
        choices=((dt.value, dt.name) for dt in DocumentType),
        default=DocumentType.GENERAL,
    )
    status = models.PositiveSmallIntegerField(
        choices=((ds.value, ds.name) for ds in DocumentStatus),
        default=DocumentStatus.DRAFT,
    )

    order = models.PositiveSmallIntegerField(default=0)

    file = models.FileField(
        upload_to=get_document_file_name,
        storage=signed_storage,
        validators=[FileExtensionValidator(["pdf"])],
    )

    preview = VersatileImageField(
        "Image",
        upload_to=get_document_preview_name,
        storage=signed_storage,
        null=True,
        blank=True,
    )

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # TODO: Only do this if the file has changed
        with signed_storage.open(self.file.name) as f:
            data = f.read()

        file = fitz.Document(stream=data)
        file_page = file.load_page(0)
        preview = file_page.get_pixmap(dpi=150).tobytes(output="png")
        self.preview = ImageFile(BytesIO(preview), name=f"{self.id}.png")

        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("code", "language", "version")


class EmailAttachment(StandardModel, Timestamps):
    document = models.ForeignKey(
        Document, related_name="email_attachments", on_delete=models.CASCADE
    )
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EmailType),
    )
