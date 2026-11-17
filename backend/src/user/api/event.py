from uuid import UUID

from django.core import signing
from django.utils import timezone

from payment.models import Entity
from user.models import User


def get_events_signup_token(
    user_id: UUID | None = None, entity_id: UUID | None = None
) -> str:
    if entity_id:
        entity_obj = Entity.objects.filter(id=entity_id).select_related("user").first()

        return signing.dumps(
            {
                "entity_id": str(entity_obj.id),
                **({"user_id": str(entity_obj.user_id)} if entity_obj.user else {}),
            },
            salt="events-signup",
        )

    user_obj = User.objects.filter(id=user_id).select_related("entity").first()

    return signing.dumps(
        {
            "user_id": str(user_obj.id),
            **(
                {"entity_id": str(user_obj.entity_id)}
                if hasattr(user_obj, "entity")
                else {}
            ),
        },
        salt="events-signup",
    )


def get_user_by_events_signup_token(token: str) -> User | None:
    try:
        data: dict = signing.loads(
            token, salt="events-signup", max_age=timezone.timedelta(days=7)
        )
    except Exception:
        return None

    if "user_id" not in data:
        return None

    return User.objects.filter(id=data["user_id"]).first()


def get_entity_by_events_signup_token(token: str) -> Entity | None:
    try:
        data: dict = signing.loads(
            token, salt="events-signup", max_age=timezone.timedelta(days=7)
        )
    except Exception:
        return None

    if "entity_id" not in data:
        return None

    return Entity.objects.filter(id=data["entity_id"]).first()
