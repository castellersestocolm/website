import importlib
from typing import List
from uuid import UUID

from comunicat.enums import Module
from payment.api.provider import PaymentProviderBase
from payment.models import PaymentProvider


def get_list(module: Module) -> List[PaymentProvider]:
    return list(
        PaymentProvider.objects.with_name().order_by("-is_enabled", "order", "code")
    )


def get_classes(module: Module) -> dict[UUID, PaymentProviderBase.__class__]:
    payment_provider_objs = get_list(module=module)

    return {
        payment_provider_obj.id: getattr(
            importlib.import_module(
                f"payment.api.provider.{payment_provider_obj.code.lower()}"
            ),
            f"PaymentProvider{payment_provider_obj.code.capitalize()}",
        )
        for payment_provider_obj in payment_provider_objs
        if payment_provider_obj.is_enabled
    }


def get_class(provider_id: UUID) -> PaymentProviderBase.__class__ | None:
    payment_provider_obj = PaymentProvider.objects.filter(
        id=provider_id, is_enabled=True
    ).first()

    if not payment_provider_obj:
        return None

    return getattr(
        importlib.import_module(
            f"payment.api.provider.{payment_provider_obj.code.lower()}"
        ),
        f"PaymentProvider{payment_provider_obj.code.capitalize()}",
    )
