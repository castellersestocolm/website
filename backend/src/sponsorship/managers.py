from django.db.models import BooleanField, Case, QuerySet, Value, When
from django.db.models.fields.json import KeyTextTransform
from django.utils import timezone, translation


class SponsorshipQuerySet(QuerySet):
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


class TierQuerySet(QuerySet):
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


class RewardQuerySet(QuerySet):
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


class EntityTierQuerySet(QuerySet):
    def with_is_active(self):
        date_today = timezone.localdate()

        return self.annotate(
            is_active=Case(
                When(
                    date_from__lte=date_today,
                    date_to__gte=date_today,
                    then=Value(True),
                ),
                default=Value(False),
                output_field=BooleanField(),
            ),
        )

    def filter_is_active(self):
        return self.with_is_active().filter(
            is_active=True,
        )
