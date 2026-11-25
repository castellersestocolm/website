import decimal

from django.conf import settings
from djmoney.contrib.exchange.models import convert_money
from djmoney.money import Money


def get_amount_in_currency(
    amount: Money, currency: str = settings.MODULE_ALL_CURRENCY
) -> Money:
    if amount.currency == currency:
        return amount

    return Money(
        convert_money(amount, currency).amount.to_integral(rounding=decimal.ROUND_UP),
        currency,
    )
