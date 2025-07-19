from decimal import Decimal

from django.db.models import CharField
from djmoney.money import Money

from django.conf import settings


class MoneyOutput(CharField):
    def from_db_value(self, value, expression, connection):
        currency = settings.MODULE_ALL_CURRENCY
        if isinstance(value, str):
            if ";" in value:
                value, currency = value.split(";")
            value = Decimal(value)
        if value is None:
            return None
        return Money(value, currency)
