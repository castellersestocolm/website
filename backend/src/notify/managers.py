from django.db.models import (
    QuerySet,
    F,
)
from django.utils import translation


class EmailTemplateQuerySet(QuerySet):
    def with_subject(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            subject_locale=F(f"subject__{locale}"),
        )

    def with_body(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            body_locale=F(f"body__{locale}"),
        )

    def with_button_text(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            button_text_locale=F(f"button_text__{locale}"),
        )

    def with_button_url(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            button_url_locale=F(f"button_url__{locale}"),
        )
