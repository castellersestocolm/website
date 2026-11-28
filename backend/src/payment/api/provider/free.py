import logging
from uuid import UUID

from comunicat.consts import ZERO_MONEY
from payment.api.provider import PaymentProviderBase
from payment.enums import PaymentStatus

_log = logging.getLogger(__name__)


class PaymentProviderFree(PaymentProviderBase):

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

    def create(self, *args, **kwargs) -> str | None:
        assert self.order_obj.amount.amount == ZERO_MONEY.amount

        return None

    def capture(self, *args, **kwargs) -> PaymentStatus:
        assert self.order_obj.amount.amount == ZERO_MONEY.amount

        return PaymentStatus.COMPLETED

    def refund(self, *args, **kwargs) -> PaymentStatus:
        assert self.order_obj.amount.amount == ZERO_MONEY.amount

        return PaymentStatus.COMPLETED

    def cancel(self, *args, **kwargs) -> bool:
        assert self.order_obj.amount.amount == ZERO_MONEY.amount

        return True
