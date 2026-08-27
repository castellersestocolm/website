from uuid import UUID

from django.db import transaction
from django.utils import timezone

import user.tasks
from comunicat.enums import Module
from consent.consts import REQUIRED_CONSENT_TYPE_BY_MODULE
from consent.enums import ConsentType
from consent.fields import Consent
from consent.models import EntityConsent


def get_list(
    user_id: UUID,
    module: Module,
) -> list[EntityConsent]:
    return list(
        EntityConsent.objects.filter(
            entity__user_id=user_id, module=module, deleted_at__isnull=True
        )
        .with_is_required()
        .order_by("type")
    )


def add_consents(
    entity_id: UUID,
    module: Module,
    consent_types: list[ConsentType] | None = None,
    newsletter_ids: list[UUID] | None = None,
) -> list[EntityConsent]:
    return update_consents(
        entity_id=entity_id,
        module=module,
        consents=[Consent(consent_type=ct, is_active=True) for ct in consent_types]
        + (
            [
                Consent(
                    consent_type=ConsentType.NEWSLETTER,
                    is_active=True,
                    newsletter_id=newsletter_id,
                )
                for newsletter_id in newsletter_ids
            ]
            if newsletter_ids
            else []
        ),
    )


@transaction.atomic
def update_consents(
    entity_id: UUID,
    module: Module,
    consents: list[Consent],
) -> list[EntityConsent]:
    time_now = timezone.now()

    entity_consent_objs = []

    for consent in consents:
        if consent.consent_type == ConsentType.NEWSLETTER:
            entity_consent_data = {
                "type": ConsentType.NEWSLETTER,
                "newsletter_id": consent.newsletter_id,
            }
        else:
            entity_consent_data = {"type": consent.consent_type}

        if consent.is_active:
            entity_consent_obj, __ = EntityConsent.objects.get_or_create(
                entity_id=entity_id,
                deleted_at=None,
                module=module,
                **entity_consent_data,
            )
            entity_consent_objs.append(entity_consent_obj)
        else:
            current_entity_consent_objs = list(
                EntityConsent.objects.filter(
                    entity_id=entity_id,
                    deleted_at=None,
                    module=module,
                    **entity_consent_data,
                )
            )

            for current_entity_consent_obj in current_entity_consent_objs:
                current_entity_consent_obj.deleted_at = time_now
                current_entity_consent_obj.save(update_fields=("deleted_at",))

            entity_consent_objs += current_entity_consent_objs

    for entity_consent_obj in entity_consent_objs:
        transaction.on_commit(
            lambda: user.tasks.sync_from_consent(
                entity_consent_id=entity_consent_obj.id
            )
        )

    return entity_consent_objs


def remove_consent(
    consent_id: UUID,
    user_id: UUID,
    module: Module,
) -> bool:
    entity_consent_obj = EntityConsent.objects.filter(
        id=consent_id, entity__user_id=user_id, module=module
    ).first()

    if not entity_consent_obj:
        return False

    if entity_consent_obj.type in REQUIRED_CONSENT_TYPE_BY_MODULE[module]:
        return False

    entity_consent_obj.deleted_at = timezone.now()
    entity_consent_obj.save(update_fields=("deleted_at",))

    return True
