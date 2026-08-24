import decimal
import logging
from uuid import UUID

from django.conf import settings
from djmoney.money import Money
from sumup import Sumup
from sumup._exceptions import APIError

from comunicat.consts import ZERO_MONEY
from order.enums import OrderStatus
from payment.api.provider import PaymentProviderBase
from payment.enums import PaymentStatus

_log = logging.getLogger(__name__)


class PaymentProviderSumUp(PaymentProviderBase):
    client: Sumup

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

        self.client = Sumup(api_key=settings.PAYMENT_PROVIDER_SUMUP_API_KEY)

    def create(self, *args, force: bool = False, **kwargs) -> str | None:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            not force
            and self.payment_order_obj
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

            self.payment_order_obj.external_id = checkout.id

            self.payment_order_obj.save(update_fields=("external_id",))

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

    def capture(self, *args, **kwargs) -> PaymentStatus:
        assert self.order_obj.status <= OrderStatus.REQUESTED

        if (
            self.payment_order_obj.status > PaymentStatus.PROCESSING
            or not self.payment_order_obj.external_id
        ):
            return PaymentStatus.CANCELED

        try:
            result = self.client.checkouts.get(
                checkout_id=self.payment_order_obj.external_id,
            )

            if result.status == "PAID":
                return PaymentStatus.COMPLETED
            elif result.status == "PENDING":
                return PaymentStatus.PROCESSING
            return PaymentStatus.CANCELED
        except APIError as e:
            _log.exception(e)

        return PaymentStatus.CANCELED

    def refund(self, *args, **kwargs) -> PaymentStatus:
        assert self.order_obj.status >= OrderStatus.PROCESSING

        try:
            checkout = self.client.checkouts.get(
                checkout_id=self.payment_order_obj.external_id,
            )
        except APIError as e:
            _log.exception(e)
            return PaymentStatus.CANCELED

        if not checkout or not checkout.transactions:
            return PaymentStatus.CANCELED

        has_error = False

        for checkout_transaction in checkout.transactions:
            if checkout_transaction.status in ("PENDING", "SUCCESSFUL"):
                try:
                    self.client.transactions.refund(
                        transaction_id=checkout_transaction.id,
                        merchant_code=checkout.merchant_code,
                    )
                except APIError as e:
                    _log.exception(e)
                    has_error = True

        return PaymentStatus.PENDING if has_error else PaymentStatus.COMPLETED

    def cancel(self, *args, **kwargs) -> bool:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            not self.payment_order_obj
            or self.payment_order_obj.provider.code != "SUMUP"
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

    def fees(self, *args, **kwargs) -> Money:  # noqa: C901
        if not self.payment_order_obj.external_id:
            return ZERO_MONEY

        try:
            checkout = self.client.checkouts.get(
                checkout_id=self.payment_order_obj.external_id,
            )
        except APIError as e:
            _log.exception(e)
            return ZERO_MONEY

        if not checkout or not checkout.transactions:
            return ZERO_MONEY

        transactions = []

        for checkout_transaction in checkout.transactions:
            if checkout_transaction.status not in ("FAILED", "CANCELLED"):
                try:
                    transaction = self.client.transactions.get(
                        id=checkout_transaction.id,
                        merchant_code=checkout.merchant_code,
                    )
                    transactions.append(transaction)
                except APIError as e:
                    _log.exception(e)

        amount_paid = ZERO_MONEY
        amount_to_receive = ZERO_MONEY
        for transaction in transactions:
            amount_paid += Money(transaction.amount, settings.MODULE_ALL_CURRENCY)
            for transaction_event in transaction.transaction_events:
                transaction_event_money = Money(
                    transaction_event.amount, settings.MODULE_ALL_CURRENCY
                )
                if transaction_event.event_type == "PAYOUT":
                    amount_to_receive += transaction_event_money
                # TODO: Add test coverage for refunds
                # else:
                #     amount_to_receive -= transaction_event_money

        return max(ZERO_MONEY, amount_paid - amount_to_receive)
