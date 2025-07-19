from typing import List

from comunicat.enums import Module
from order.models import DeliveryPrice


def get_list(module: Module) -> List[DeliveryPrice]:
    return list(
        DeliveryPrice.objects.with_price()
        .select_related("country", "region")
        .order_by("provider", "country", "region", "max_grams", "price")
    )
