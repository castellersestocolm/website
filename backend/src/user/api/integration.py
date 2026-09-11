from uuid import UUID

from django.core import signing
from django.utils import timezone

from user.models import User


def get_integration_apple_wallet_token(user_id: UUID) -> str:
    return signing.dumps(
        {"user_id": str(user_id)},
        salt="integration-apple-wallet",
    )


def get_user_by_integration_apple_wallet_token(token: str) -> User | None:
    try:
        data: dict = signing.loads(
            token, salt="integration-apple-wallet", max_age=timezone.timedelta(days=30)
        )
    except Exception:
        return None

    return User.objects.filter(id=data["user_id"]).first()
