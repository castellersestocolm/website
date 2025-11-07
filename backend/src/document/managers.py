from django.apps import apps
from django.conf import settings
from django.db.models import (
    QuerySet,
    Sum,
    IntegerField,
    Value,
    Subquery,
    OuterRef,
    Case,
    When,
)
from django.db.models.functions import Coalesce
from django.utils import translation

from user.enums import FamilyMemberRole


class DocumentQuerySet(QuerySet):
    def with_language_match(self):
        locale = translation.get_language()

        return self.annotate(
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


class EmailAttachmentQuerySet(QuerySet):
    def with_language_match(self):
        locale = translation.get_language()

        return self.annotate(
            language_match=Case(
                When(document__language=locale, then=Value(0)),
                *[
                    When(
                        document__language=language_fallback,
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
