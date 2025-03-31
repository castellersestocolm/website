from uuid import UUID

from django.db import transaction

from payment.models import Entity


@transaction.atomic
def merge(entity_ids: list[UUID]) -> Entity | None:
    entity_objs = list(Entity.objects.filter(id__in=entity_ids).order_by("created_at"))

    if not entity_objs:
        return None

    entity_obj = entity_objs[0]

    for duplicate_entity_obj in entity_objs:
        entity_obj.firstname = entity_obj.firstname or duplicate_entity_obj.firstname
        entity_obj.lastname = entity_obj.lastname or duplicate_entity_obj.lastname
        entity_obj.email = entity_obj.email or duplicate_entity_obj.email
        entity_obj.phone = entity_obj.phone or duplicate_entity_obj.phone

        if entity_obj.user:
            if (
                duplicate_entity_obj.user
                and entity_obj.user == duplicate_entity_obj.user
            ):
                return None
        else:
            entity_obj.user = duplicate_entity_obj.user

    Entity.objects.filter(id__in=entity_ids).exclude(id=entity_obj.id).delete()

    entity_obj.save(update_fields=("firstname", "lastname", "email", "phone", "user"))

    return entity_obj
