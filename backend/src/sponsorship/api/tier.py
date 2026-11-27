from uuid import UUID

from django.db.models import Q

from comunicat.enums import Module
from payment.models import Entity
from sponsorship.models import TierPrice


def get_tier_price(entity_id: UUID, tier_id: UUID) -> TierPrice | None:
    entity_obj = (
        Entity.objects.filter(id=entity_id)
        .select_related("user")
        .with_has_active_membership()
        .first()
    )

    if not entity_obj:
        return None

    modules = [
        module
        for module in Module
        if getattr(entity_obj, f"has_active_membership_{module.name.lower()}")
    ]

    event_tier_objs = list(
        TierPrice.objects.filter(
            Q(module__isnull=True) | Q(module__in=modules),
            tier_id=tier_id,
        ).order_by("amount")
    )

    min_tier_price_obj_by_module: dict[Module, TierPrice] = {}
    for event_tier_obj in event_tier_objs:
        current_min_tier_price_obj = min_tier_price_obj_by_module.get(
            event_tier_obj.module
        )
        if (
            not current_min_tier_price_obj
            or current_min_tier_price_obj.amount <= event_tier_obj.amount
        ):
            min_tier_price_obj_by_module[event_tier_obj.module] = event_tier_obj

    if min_tier_price_obj_by_module:
        return min(min_tier_price_obj_by_module.values(), key=lambda ep: ep.amount)

    return None
