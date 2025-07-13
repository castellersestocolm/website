from djmoney.models.fields import MoneyField
from djmoney.money import Money

from django.conf import settings


class MoneyOutput(MoneyField):
    def from_db_value(self, value, expression, connection):
        if value is None:
            return None
        return Money(value, settings.MODULE_ALL_CURRENCY)
