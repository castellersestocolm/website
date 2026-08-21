import logging
from uuid import UUID

from payment.api.provider import PaymentProviderBase
from payment.enums import PaymentStatus

_log = logging.getLogger(__name__)


class PaymentProviderTransfer(PaymentProviderBase):

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

    def capture(self, *args, **kwargs) -> PaymentStatus:
        return PaymentStatus.PENDING
