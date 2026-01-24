from django.db.models import (
    QuerySet,
    F,
)
from django.utils import translation


class HistoryEventQuerySet(QuerySet):
    def with_title(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            title_locale=F(f"title__{locale}"),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=F(f"description__{locale}"),
        )
