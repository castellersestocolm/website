import decimal
import logging
from uuid import UUID

from django.conf import settings
from sumup import Sumup
from sumup._exceptions import APIError

from order.enums import OrderStatus
from payment.api.provider import PaymentProviderBase
from payment.enums import PaymentStatus

_log = logging.getLogger(__name__)


class PaymentProviderSumup(PaymentProviderBase):
    client: Sumup

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

        self.client = Sumup(api_key=settings.PAYMENT_PROVIDER_SUMUP_API_KEY)

    def create(self) -> str | None:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            self.payment_order_obj
            and self.payment_order_obj.provider.code == "SUMUP"
            and self.payment_order_obj.external_id
        ):
            return self.payment_order_obj.external_id

        try:
            checkout = self.client.checkouts.create(
                merchant_code=settings.PAYMENT_PROVIDER_SUMUP_MERCHANT_CODE,
                amount=int(
                    (100 * self.order_obj.amount.amount).to_integral(
                        rounding=decimal.ROUND_UP
                    )
                )
                / 100,
                checkout_reference=self.order_obj.reference,
                currency=str(self.order_obj.amount.currency),
            )

            return checkout.id
        except APIError:
            try:
                checkouts = self.client.checkouts.list(
                    checkout_reference=self.order_obj.reference
                )

                if checkouts:
                    return checkouts[0].id
                return None
            except APIError as e:
                _log.exception(e)

        return None

    def capture(self) -> bool:
        assert self.order_obj.status <= OrderStatus.REQUESTED

        if (
            self.payment_order_obj.status > PaymentStatus.PROCESSING
            or not self.payment_order_obj.external_id
        ):
            return False

        try:
            result = self.client.checkouts.get(
                checkout_id=self.payment_order_obj.external_id,
            )

            return result.status == "PAID"
        except APIError as e:
            _log.exception(e)

        return False

    def cancel(self) -> bool:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            not self.payment_order_obj
            or self.payment_order_obj.provider.code == "SUMUP"
            or not self.payment_order_obj.external_id
        ):
            return True

        try:
            self.client.checkouts.deactivate(
                checkout_id=self.payment_order_obj.external_id,
            )

            return True
        except APIError as e:
            _log.exception(e)

        return False
