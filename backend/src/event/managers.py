import datetime

from django.apps import apps
from django.conf import settings
from django.db.models import (
    QuerySet,
    Value,
    Subquery,
    OuterRef,
    BooleanField,
    Case,
    When,
    F,
)
from django.db.models.functions import Coalesce
from django.utils import timezone, translation

from comunicat.enums import Module


class EventQuerySet(QuerySet):
    def with_module_information(self, module: Module):
        EventModule = apps.get_model("event", "EventModule")

        return self.annotate(
            require_signup=Coalesce(
                Subquery(
                    EventModule.objects.filter(
                        event_id=OuterRef("id"),
                        module=module,
                    ).values_list("require_signup", flat=True)[:1]
                ),
                Value(False),
                output_field=BooleanField(),
            ),
            require_approve=Coalesce(
                Subquery(
                    EventModule.objects.filter(
                        event_id=OuterRef("id"),
                        module=module,
                    ).values_list("require_approve", flat=True)[:1]
                ),
                Value(False),
                output_field=BooleanField(),
            ),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=F(f"description__{locale}"),
        )


class AgendaItemQuerySet(QuerySet):
    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"name__{locale}"),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=F(f"description__{locale}"),
        )


class RegistrationQuerySet(QuerySet):
    def with_is_user_adult(self):
        date_today = timezone.localdate()
        return self.annotate(
            is_user_adult=Case(
                When(user__birthday__isnull=True, then=Value(True)),
                When(
                    user__birthday__lte=datetime.date(
                        date_today.year - settings.MODULE_ALL_USER_MINIMUM_AGE,
                        date_today.month,
                        date_today.day,
                    ),
                    then=Value(True),
                ),
                default=Value(False),
                output_field=BooleanField(),
            ),
        )

    def filter_with_user(self):
        return self.filter(entity__user__isnull=False)
