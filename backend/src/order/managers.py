from django.db.models import (
    QuerySet,
    Sum,
    Value,
    Case,
    When,
    F,
    CharField,
)
from django.db.models.functions import Coalesce, Concat, Cast

from comunicat.utils.managers import MoneyOutput


class OrderQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(
            amount=Coalesce(
                Sum("products__amount"), Value(0), output_field=MoneyOutput()
            )
        )


class DeliveryPriceQuerySet(QuerySet):
    def with_price(self):
        return self.annotate(
            price_vat=Case(
                When(
                    price__isnull=False,
                    vat__isnull=False,
                    then=Concat(
                        Cast(F("vat") * F("price") / 100, output_field=CharField()),
                        Value(";"),
                        Cast(F("price_currency"), output_field=CharField()),
                    ),
                ),
                default=Value(None),
                output_field=MoneyOutput(),
            ),
        )
