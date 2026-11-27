from uuid import UUID

from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django.template.loader import render_to_string
from django.utils import timezone, translation
from weasyprint import HTML

import notify.tasks
from comunicat.consts import TEMPLATE_PDF_BY_MODULE
from comunicat.enums import Module, PDFType
from legal.models import Member
from notify.enums import EmailType
from sponsorship.api.tier import get_tier_price
from sponsorship.enums import EntityTierStatus
from sponsorship.models import EntityTier, Reward, RewardGroup, Tier


@transaction.atomic
def create(
    entity_id: UUID,
    tier_id: UUID,
    module: Module,
    reward_groups: list[dict] | None = None,
) -> EntityTier:
    tier_obj = (
        Tier.objects.filter(id=tier_id)
        .prefetch_related(
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
        .first()
    )

    tier_price_obj = get_tier_price(entity_id=entity_id, tier_id=tier_id)

    date_from = timezone.localdate()
    date_to = date_from + relativedelta(
        days=tier_obj.length_days - 1,
        months=tier_obj.length_months,
        years=tier_obj.length_years,
    )

    entity_tier_obj, __ = EntityTier.objects.update_or_create(
        entity_id=entity_id,
        tier_id=tier_id,
        status=EntityTierStatus.REQUESTED,
        defaults={
            "price": tier_price_obj,
            "date_from": date_from,
            "date_to": date_to,
        },
    )

    rewards_by_group_id = {
        reward_group["id"]: reward_group["rewards"]
        for reward_group in reward_groups or []
    }

    for reward_group_obj in tier_obj.reward_groups.all():
        rewards = rewards_by_group_id.get(reward_group_obj.id, [])

        if not rewards and not (
            reward_group_obj.min_rewards
            == reward_group_obj.max_rewards
            == reward_group_obj.rewards.count()
        ):
            assert (
                reward_group_obj.min_rewards
                <= len(rewards)
                <= reward_group_obj.max_rewards
            )

    return entity_tier_obj


@transaction.atomic
def complete_entity_tiers(
    entity_tier_ids: list[UUID],
    is_completed: bool = True,
    with_notify: bool = True,
) -> bool:
    entity_tier_objs = list(
        EntityTier.objects.filter(
            id__in=entity_tier_ids,
            status__lte=EntityTierStatus.PROCESSING,
        )
        .select_related("tier", "tier__sponsorship")
        .distinct()
    )

    if not entity_tier_objs:
        return False

    entity_tier_status = (
        EntityTierStatus.ACTIVE if is_completed else EntityTierStatus.PROCESSING
    )

    for entity_tier_obj in entity_tier_objs:
        entity_tier_obj.status = entity_tier_status

    EntityTier.objects.bulk_update(entity_tier_objs, fields=("status",))

    for entity_tier_obj in entity_tier_objs:
        if with_notify:
            transaction.on_commit(
                lambda: notify.tasks.send_entity_tier_email.delay(
                    entity_tier_id=entity_tier_obj.id,
                    email_type=EmailType.SPONSORSHIP_PAID,
                    module=entity_tier_obj.tier.sponsorship.module,
                )
            )

        transaction.on_commit(
            lambda: notify.tasks.send_donation_message_slack.delay(
                entity_tier_id=entity_tier_obj.id,
            )
        )

    return True


def get_diploma_html(entity_tier_id: UUID) -> str | None:
    entity_tier_obj = (
        EntityTier.objects.filter(id=entity_tier_id, status=EntityTierStatus.ACTIVE)
        .select_related("tier", "tier__sponsorship", "entity", "entity__user")
        .first()
    )

    module = entity_tier_obj.tier.sponsorship.module

    entity_obj = entity_tier_obj.entity
    user_obj = entity_obj.user
    locale = (
        (user_obj.preferred_language if user_obj else None)
        or (entity_obj.preferred_language if entity_obj else None)
        or settings.LANGUAGE_CODE
    )

    with translation.override(locale):
        member_obj = (
            Member.objects.filter(team__group__module=module, signature__isnull=False)
            .with_role_name()
            .select_related("user")
            .order_by("-team__group__date_from", "role__order")
            .first()
        )

        if not entity_tier_obj:
            return None

        context = {
            "entity_tier_obj": entity_tier_obj,
            "member_obj": member_obj,
        }
        html_string = render_to_string(
            template_name=TEMPLATE_PDF_BY_MODULE[module][PDFType.SPONSORSHIP_DIPLOMA][
                "pdf"
            ],
            context=context,
        )

    return html_string


def get_diploma_pdf(entity_tier_id: UUID) -> bytes | None:
    html_string = get_diploma_html(entity_tier_id=entity_tier_id)

    html = HTML(string=html_string)
    result = html.write_pdf()

    return result
