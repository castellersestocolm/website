from typing import List
from uuid import UUID

from django.db.models import Prefetch

from comunicat.enums import Module
from consent.models import EntityConsent
from legal.models import Team
from notify.models import Newsletter
from payment.models import Entity


def get_list(module: Module) -> List[Team]:
    return list(
        Newsletter.objects.filter(
            module=module,
        )
        .with_name()
        .with_description()
        .order_by("name_locale")
    )


def get_entities_by_newsletter(newsletter_id: UUID) -> list[Entity]:
    newsletter_obj = (
        Newsletter.objects.filter(id=newsletter_id)
        .select_related("google_group")
        .prefetch_related(
            Prefetch(
                "consents",
                EntityConsent.objects.filter_is_active(),
                to_attr="all_consents",
            )
        )
        .first()
    )

    if not newsletter_obj:
        return []

    return [
        entity_consent_obj.entity
        for entity_consent_obj in newsletter_obj.all_consents
        if not entity_consent_obj.deleted_at
    ]
