from uuid import UUID

from django.db.models import Q

from data.models import Country
from order.models import DeliveryPrice


def get_delivery_price(
    provider_id: UUID,
    weight: int,
    country_id: UUID | None = None,
    region_id: UUID | None = None,
) -> DeliveryPrice | None:
    zone_id = None
    if country_id is not None:
        zone_id = Country.objects.get(id=country_id).zone_id

    delivery_price_obj = (
        list(
            DeliveryPrice.objects.filter(
                Q(zone__isnull=True) | Q(zone_id=zone_id),
                Q(country__isnull=True) | Q(country_id=country_id),
                Q(region__isnull=True) | Q(region_id=region_id),
                provider_id=provider_id,
                max_grams__gte=weight,
            ).order_by("max_grams", "region", "country", "zone", "price")
        )[:1]
        + [None]
    )[0]

    if not delivery_price_obj:
        return None

    return delivery_price_obj
