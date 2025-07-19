import decimal
from decimal import Decimal
from enum import Enum
from typing import Any, Collection, Optional, TypeVar

from django.utils.translation import gettext_lazy as _
from djmoney.money import Money
from rest_framework import serializers

from djmoney.contrib.exchange.models import convert_money

from django.conf import settings


EnumT = TypeVar("EnumT", bound=Enum)


class EnumField(serializers.CharField):
    default_error_messages = {
        "not_a_member": _("Invalid value."),
        "invalid_choice": _('"{input}" is not a valid choice.'),
    }

    def __init__(
        self,
        enum: type[EnumT],
        *,
        choices: Optional[Collection[EnumT]] = None,
        **kwargs: Any,
    ):
        self.enum = enum
        self.choices = choices
        super().__init__(**kwargs)

    def to_representation(self, obj):
        return super().to_representation(obj)

    def to_internal_value(self, data) -> EnumT:
        value = super().to_internal_value(data)
        try:
            member = self.enum(value)
        except ValueError:
            self.fail("not_a_member")

        if self.choices is not None and member not in self.choices:
            self.fail("invalid_choice", input=value)

        return member


class IntEnumField(serializers.IntegerField):
    default_error_messages = {
        "not_a_member": _("Invalid value."),
        "invalid_choice": _('"{input}" is not a valid choice.'),
    }

    def __init__(
        self,
        enum: type[EnumT],
        *,
        choices: Optional[Collection[EnumT]] = None,
        **kwargs: Any,
    ):
        self.enum = enum
        self.choices = choices
        super().__init__(**kwargs)

    def to_representation(self, obj):
        return super().to_representation(obj)

    def to_internal_value(self, data) -> EnumT:
        value = super().to_internal_value(data)
        try:
            member = self.enum(value)
        except ValueError:
            self.fail("not_a_member")

        if self.choices is not None and member not in self.choices:
            self.fail("invalid_choice", input=value)

        return member


class MoneyField(serializers.DictField):
    default_error_messages = {
        "not_money": _("Not money."),
        "missing_data": _("Missing amount or currency."),
    }

    def to_representation(self, obj):
        if isinstance(obj, int):
            obj = Money(amount=obj, currency=settings.MODULE_ALL_CURRENCY)
        if isinstance(obj, Decimal):
            obj = Money(amount=obj, currency=settings.MODULE_ALL_CURRENCY)
        if not isinstance(obj, Money):
            self.fail("not_money")

        if obj.currency != settings.MODULE_ALL_CURRENCY:
            obj = convert_money(obj, settings.MODULE_ALL_CURRENCY)

        rounded_money = Money(
            obj.amount.to_integral(rounding=decimal.ROUND_UP), obj.currency
        )
        return super().to_representation(
            {"amount": rounded_money.amount, "currency": rounded_money.currency.code}
        )

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        if "amount" not in data or "currency" not in data:
            if not self.required:
                return None
            self.fail("missing_data")
        return Money(data["amount"], data["currency"])
