from typing import List

from django.db.models import Prefetch

from comunicat.enums import Module
from order.models import DeliveryProvider, DeliveryPrice


def get_list(module: Module) -> List[DeliveryProvider]:
    return list(
        DeliveryProvider.objects.prefetch_related(
            Prefetch(
                "prices",
                DeliveryPrice.objects.with_price()
                .select_related("country", "region")
                .order_by("provider", "country", "region", "max_grams", "price"),
            )
        ).order_by("type", "-created_at")
    )
