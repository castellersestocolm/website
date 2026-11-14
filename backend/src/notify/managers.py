from django.db.models import QuerySet
from django.db.models.fields.json import KeyTextTransform
from django.utils import translation


class EmailTemplateQuerySet(QuerySet):
    def with_subject(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            subject_locale=KeyTextTransform(locale, "subject"),
        )

    def with_body(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            body_locale=KeyTextTransform(locale, "body"),
        )

    def with_button_text(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            button_text_locale=KeyTextTransform(locale, "button_text"),
        )

    def with_button_url(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            button_url_locale=KeyTextTransform(locale, "button_url"),
        )


class NewsletterQuerySet(QuerySet):
    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=KeyTextTransform(locale, "name"),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=KeyTextTransform(locale, "description"),
        )
