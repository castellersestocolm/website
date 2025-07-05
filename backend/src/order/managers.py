from django.db.models import (
    QuerySet,
    Sum,
    Value,
)
from django.db.models.functions import Coalesce

from comunicat.utils.managers import MoneyOutput


class OrderQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(
            amount=Coalesce(
                Sum("products__amount"), Value(0), output_field=MoneyOutput()
            )
        )
