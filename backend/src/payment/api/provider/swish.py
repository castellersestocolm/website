import logging

from uuid import UUID

from payment.api.provider import PaymentProviderBase

_log = logging.getLogger(__name__)


class PaymentProviderSwish(PaymentProviderBase):

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

    def create(self) -> str:
        return self.order_obj.reference
