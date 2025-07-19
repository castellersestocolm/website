from typing import List

from django.db.models import Prefetch
from django.utils import timezone

from comunicat.enums import Module
from order.models import DeliveryProvider, DeliveryPrice, DeliveryDate


def get_list(module: Module) -> List[DeliveryProvider]:
    return list(
        DeliveryProvider.objects.prefetch_related(
            Prefetch(
                "prices",
                DeliveryPrice.objects.with_price()
                .select_related("country", "region")
                .order_by("provider", "country", "region", "max_grams", "price"),
            ),
            Prefetch(
                "dates",
                DeliveryDate.objects.filter(
                    # TODO: Maybe make this a variable
                    date__gte=timezone.localdate()
                    + timezone.timedelta(days=2)
                ).order_by("date"),
            ),
        ).order_by("type", "-created_at")
    )
