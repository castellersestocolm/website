from uuid import UUID

from consent.enums import ConsentType
from consent.models import EntityConsent


def add_consents(
    entity_id: UUID,
    consent_types: list[ConsentType] | None = None,
    newsletter_ids: list[UUID] | None = None,
) -> list[EntityConsent]:
    entity_consent_objs = []

    if consent_types:
        for consent_type in consent_types:
            if consent_type not in (ConsentType.NEWSLETTER,):
                entity_consent_obj, __ = EntityConsent.objects.get_or_create(
                    entity_id=entity_id,
                    type=consent_type,
                    deleted_at=None,
                )
                entity_consent_objs.append(entity_consent_obj)

    if newsletter_ids:
        for newsletter_id in newsletter_ids:
            entity_consent_obj, __ = EntityConsent.objects.get_or_create(
                entity_id=entity_id,
                type=ConsentType.NEWSLETTER,
                newsletter_id=newsletter_id,
                deleted_at=None,
            )
            entity_consent_objs.append(entity_consent_obj)

    return entity_consent_objs
