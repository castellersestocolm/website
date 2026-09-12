from uuid import UUID

from django.core import signing
from django.utils import timezone

from comunicat.enums import Module


def get_integration_apple_wallet_token(user_id: UUID, module: Module) -> str:
    return signing.dumps(
        {"user_id": str(user_id), "module": module},
        salt="integration-apple-wallet",
    )


def get_user_data_by_integration_apple_wallet_token(token: str) -> dict | None:
    try:
        data: dict = signing.loads(
            token, salt="integration-apple-wallet", max_age=timezone.timedelta(days=30)
        )
    except Exception:
        return None

    return data
