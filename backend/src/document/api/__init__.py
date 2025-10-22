from django.utils import translation

from comunicat.enums import Module
from document.enums import DocumentStatus
from document.models import Document


def get_list(module: Module) -> list[Document]:
    locale = translation.get_language()

    return sorted(
        list(
            Document.objects.filter(
                status=DocumentStatus.PUBLISHED, module=module, language=locale
            )
            .order_by("code", "-version")
            .distinct("code")
        ),
        key=lambda document_obj: document_obj.order,
    )
