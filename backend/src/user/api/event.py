from uuid import UUID

from django.core import signing
from django.utils import timezone

from user.models import User


def get_events_signup_token(user_id: UUID) -> str:
    return signing.dumps(
        {"user_id": str(user_id)},
        salt="events-signup",
    )


def get_user_by_events_signup_token(token: str) -> User | None:
    try:
        data: dict = signing.loads(
            token, salt="events-signup", max_age=timezone.timedelta(days=7)
        )
    except Exception:
        return None

    return User.objects.filter(id=data["user_id"]).first()
