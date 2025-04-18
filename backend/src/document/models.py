import os

from django.core.validators import FileExtensionValidator

from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models

from comunicat.storage import signed_storage
from document.enums import DocumentType, DocumentStatus
from notify.enums import EmailType


def get_document_file_name(instance, filename):
    return os.path.join(
        "document/document/file/", instance.id + instance.file_extension
    )


class Document(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)

    language = models.CharField(max_length=255)

    version = models.PositiveIntegerField(default=0)

    type = models.PositiveSmallIntegerField(
        choices=((dt.value, dt.name) for dt in DocumentType),
        default=DocumentType.GENERAL,
    )
    status = models.PositiveSmallIntegerField(
        choices=((ds.value, ds.name) for ds in DocumentStatus),
        default=DocumentStatus.DRAFT,
    )

    file = models.FileField(
        upload_to=get_document_file_name,
        storage=signed_storage,
        validators=[FileExtensionValidator(["pdf"])],
    )

    def __str__(self) -> str:
        return self.name

    class Meta:
        unique_together = ("code", "language", "version")


class EmailAttachment(StandardModel, Timestamps):
    document = models.ForeignKey(
        Document, related_name="email_attachments", on_delete=models.CASCADE
    )
    type = models.PositiveSmallIntegerField(
        choices=((et.value, et.name) for et in EmailType),
    )
