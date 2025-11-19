from uuid import UUID

from django.db import transaction

from order.models import Order
from payment.models import Entity, Payment
from product.models import StockOrder
from user.models import User


# TODO: Detect if any model is using an entity that will be deleted before deleting it
@transaction.atomic
def merge(entity_ids: list[UUID]) -> Entity | None:
    entity_objs = list(Entity.objects.filter(id__in=entity_ids).order_by("created_at"))

    if not entity_objs:
        return None

    entity_obj = entity_objs[0]

    for duplicate_entity_obj in entity_objs[1:]:
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

    # Update all payments to the remaining entity
    Payment.objects.filter(entity_id__in=entity_ids).exclude(entity=entity_obj).update(
        entity=entity_obj
    )

    # Update all stock orders to the remaining entity
    StockOrder.objects.filter(entity_id__in=entity_ids).exclude(
        entity=entity_obj
    ).update(entity=entity_obj)

    # Update all orders to the remaining entity
    Order.objects.filter(entity_id__in=entity_ids).exclude(entity=entity_obj).update(
        entity=entity_obj
    )

    # Delete old entities
    Entity.objects.filter(id__in=entity_ids).exclude(id=entity_obj.id).delete()

    entity_obj.save(update_fields=("firstname", "lastname", "email", "phone", "user"))

    return entity_obj


def get_entity_by_key(email: str | None = None, user_id: UUID | None = None) -> Entity:
    if email:
        user_obj = User.objects.filter(email=email).first()
    else:
        user_obj = User.objects.get(id=user_id)

    if user_obj and hasattr(user_obj, "entity"):
        return user_obj.entity

    entity_obj, __ = Entity.objects.update_or_create(
        email=email, defaults={"user_id": user_obj.id if user_obj else None}
    )

    return entity_obj
