import importlib
from typing import List
from uuid import UUID

from django.db.models import Q

from comunicat.enums import Module
from payment.api.provider import PaymentProviderBase
from payment.consts import PAYMENT_METHOD_REQUIRE_SOURCE, PAYMENT_PROVIDER_CLASS_BY_CODE
from payment.models import PaymentProvider


def get_list(module: Module) -> List[PaymentProvider]:
    return list(
        PaymentProvider.objects.filter(
            Q(method__in=PAYMENT_METHOD_REQUIRE_SOURCE, source__isnull=False)
            | ~Q(method__in=PAYMENT_METHOD_REQUIRE_SOURCE),
            is_visible=True,
        )
        .with_name()
        .order_by("-is_enabled", "order", "code")
    )


def get_classes(module: Module) -> dict[UUID, PaymentProviderBase.__class__]:
    payment_provider_objs = get_list(module=module)

    return {
        payment_provider_obj.id: getattr(
            importlib.import_module(
                f"payment.api.provider.{PAYMENT_PROVIDER_CLASS_BY_CODE[payment_provider_obj.code.upper()][0]}"
            ),
            PAYMENT_PROVIDER_CLASS_BY_CODE[payment_provider_obj.code.upper()][1],
        )
        for payment_provider_obj in payment_provider_objs
        if payment_provider_obj.is_enabled
        and payment_provider_obj.code.upper() in PAYMENT_PROVIDER_CLASS_BY_CODE
    }


def get_class(provider_id: UUID) -> PaymentProviderBase.__class__ | None:
    payment_provider_obj = PaymentProvider.objects.filter(
        id=provider_id, is_enabled=True
    ).first()

    if (
        not payment_provider_obj
        or payment_provider_obj.code.upper() not in PAYMENT_PROVIDER_CLASS_BY_CODE
    ):
        return None

    return getattr(
        importlib.import_module(
            f"payment.api.provider.{PAYMENT_PROVIDER_CLASS_BY_CODE[payment_provider_obj.code.upper()][0]}"
        ),
        PAYMENT_PROVIDER_CLASS_BY_CODE[payment_provider_obj.code.upper()][1],
    )
