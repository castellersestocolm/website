from typing import List
from uuid import UUID

from comunicat.enums import Module
from legal.models import Team
from notify.enums import NewsletterType
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
            "google_group__users", "google_group__users__entity", "consents"
        )
        .first()
    )

    if not newsletter_obj:
        return []

    # TODO: Perhaps use entity consents only
    if newsletter_obj.type == NewsletterType.GOOGLE:
        return [
            google_group_user_obj.entity
            for google_group_user_obj in newsletter_obj.google_group.users.all()
        ]

    return [
        entity_consent_obj.entity
        for entity_consent_obj in newsletter_obj.consents
        if not entity_consent_obj.deleted_at
    ]
