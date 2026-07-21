from django.apps import apps
from django.db.models import (
    BooleanField,
    F,
    OuterRef,
    QuerySet,
    Subquery,
    Sum,
    UUIDField,
    Value,
)
from django.db.models.functions import Cast, Coalesce
from django.utils import translation

from comunicat.enums import Module
from comunicat.utils.managers import MoneyOutput


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
    def filter_with_user(self):
        return self.filter(entity__user__isnull=False)

    def with_event_title(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            event_title_locale=F(f"event__title__{locale}"),
        )

    def with_amount(self):
        PaymentLine = apps.get_model("payment", "PaymentLine")

        return self.annotate(
            amount=Coalesce(
                Subquery(
                    PaymentLine.objects.filter(
                        item_type__app_label="event",
                        item_type__model="registration",
                    )
                    .annotate(item_uuid=Cast(F("item_id"), output_field=UUIDField()))
                    .filter(
                        item_uuid=OuterRef("id"),
                    )
                    .values("item_id")
                    .annotate(sum=Sum("amount"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=MoneyOutput(),
            )
        )
