from django.db.models import QuerySet
from django.db.models.fields.json import KeyTextTransform
from django.utils import translation


class HistoryEventQuerySet(QuerySet):
    def with_title(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            title_locale=KeyTextTransform(locale, "title"),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=KeyTextTransform(locale, "description"),
        )
