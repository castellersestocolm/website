from django.db.models import Case, When, Value, IntegerField
from django.utils import translation

from comunicat.enums import Module
from document.enums import DocumentStatus
from document.models import Document

from django.conf import settings


def get_list(module: Module) -> list[Document]:
    return sorted(
        list(
            Document.objects.filter(status=DocumentStatus.PUBLISHED, module=module)
            .with_language_match()
            .order_by("code", "language_match", "-version")
            .distinct("code")
        ),
        key=lambda document_obj: document_obj.order,
    )
