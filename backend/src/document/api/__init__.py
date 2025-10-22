from django.db.models import Case, When, Value, IntegerField
from django.utils import translation

from comunicat.enums import Module
from document.enums import DocumentStatus
from document.models import Document

from django.conf import settings


def get_list(module: Module) -> list[Document]:
    locale = translation.get_language()

    return sorted(
        list(
            Document.objects.filter(status=DocumentStatus.PUBLISHED, module=module)
            .annotate(
                language_match=Case(
                    When(language=locale, then=Value(0)),
                    *[
                        When(
                            language=language_fallback,
                            then=i + 1,
                        )
                        for i, language_fallback in enumerate(
                            settings.LANGUAGES_FALLBACK.get(locale, [])
                        )
                    ],
                    default=Value(0),
                    output_field=IntegerField(),
                ),
            )
            .order_by("code", "language_match", "-version")
            .distinct("code")
        ),
        key=lambda document_obj: document_obj.order,
    )
