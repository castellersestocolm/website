from typing import List
from uuid import UUID

from django.db.models import Prefetch, Q
from django.utils import timezone

from comunicat.enums import Module
from sponsorship.enums import SponsorshipStatus
from sponsorship.models import Reward, RewardGroup, Sponsorship, Tier, TierPrice


def get_list(
    module: Module, event_id: UUID | None = None, code: str | None = None
) -> List[Sponsorship]:
    date_today = timezone.localdate()

    sponsorship_filter = Q()

    if event_id:
        sponsorship_filter &= Q(event_id=event_id)

    if code:
        sponsorship_filter &= Q(code=code)

    return list(
        Sponsorship.objects.filter(
            sponsorship_filter,
            Q(date_from__isnull=True) | Q(date_from__lte=date_today),
            Q(date_to__isnull=True) | Q(date_to__gte=date_today),
            module=module,
            status=SponsorshipStatus.PUBLISHED,
        )
        .with_name()
        .with_description()
        .prefetch_related(
            Prefetch(
                "tiers",
                (
                    Tier.objects.with_name()
                    .with_description()
                    .prefetch_related(
                        Prefetch(
                            "prices",
                            (
                                TierPrice.objects.order_by(
                                    "module",
                                    "-amount",
                                )
                            ),
                        ),
                        Prefetch(
                            "reward_groups",
                            (
                                RewardGroup.objects.prefetch_related(
                                    Prefetch(
                                        "rewards",
                                        (
                                            Reward.objects.with_name()
                                            .with_description()
                                            .order_by("type", "name_locale")
                                        ),
                                    ),
                                ).order_by("order")
                            ),
                        ),
                    )
                    .order_by("order")
                ),
            ),
        )
        .order_by("date_from", "date_to", "code")
    )


def get(
    module: Module,
    event_id: UUID | None = None,
    code: str | None = None,
) -> Sponsorship | None:
    return (
        get_list(
            event_id=event_id,
            code=code,
            module=module,
        )
        + [None]
    )[0]
