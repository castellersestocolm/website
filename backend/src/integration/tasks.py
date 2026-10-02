from uuid import UUID

from celery import shared_task

import integration.api.google.wallet
from comunicat.enums import Module


# TODO: Update Apple passes
@shared_task(rate_limit="1/s")
def update_wallet_loyalty_passes(user_id: UUID, module: Module) -> None:
    update_google_wallet_loyalty_pass.delay(user_id=user_id, module=module)


@shared_task(rate_limit="1/s")
def update_google_wallet_loyalty_pass(user_id: UUID, module: Module) -> None:
    integration.api.google.wallet.update_loyalty_pass(user_id=user_id, module=module)


# TODO: Update Apple passes
@shared_task(rate_limit="1/s")
def update_wallet_event_passes(registration_id: UUID) -> None:
    integration.api.google.wallet.update_event_pass(registration_id=registration_id)


@shared_task(rate_limit="1/s")
def update_google_wallet_event_pass(registration_id: UUID) -> None:
    integration.api.google.wallet.update_event_pass(registration_id=registration_id)
