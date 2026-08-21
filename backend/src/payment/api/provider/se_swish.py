import decimal
import logging
from uuid import UUID

from django.conf import settings
from django.urls import reverse
from django.utils import timezone, translation
from django.utils.translation import gettext_lazy as _
from requests import HTTPError
from swish import Environment, SwishClient

from comunicat.template_tags.comunicat_tags import full_url
from order.enums import OrderStatus, OrderType
from payment.api.provider import PaymentProviderBase
from payment.enums import PaymentStatus

_log = logging.getLogger(__name__)


class PaymentProviderSESwish(PaymentProviderBase):
    client: SwishClient

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

        self.client = SwishClient(
            environment=Environment.All[settings.PAYMENT_PROVIDER_SE_SWISH_ENVIRONMENT],
            merchant_swish_number=settings.PAYMENT_PROVIDER_SE_SWISH_MERCHANT_NUMBER,
            cert=(
                f"{settings.PAYMENT_PROVIDER_SE_SWISH_CERT_DIR}cert.pem",
                f"{settings.PAYMENT_PROVIDER_SE_SWISH_CERT_DIR}key.pem",
            ),
            verify=f"{settings.PAYMENT_PROVIDER_SE_SWISH_CERT_DIR}verify.pem",
        )

    def create(self, *args, force: bool = False, **kwargs) -> str | None:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            not force
            and self.payment_order_obj
            and self.payment_order_obj.provider.code == "SE_SWISH"
            and self.payment_order_obj.external_id
        ):
            return self.payment_order_obj.external_id

        with translation.override(self.order_obj.origin_language):
            if self.order_obj.type == OrderType.MEMBERSHIP:
                text_order = _("Membership")
                text = f"{text_order} {timezone.localdate().year}"
            else:
                text_order = _("Order")
                text = f"{text_order} {self.order_obj.reference}"

        try:
            payment = self.client.create_payment(
                payee_payment_reference=self.order_obj.reference,
                callback_url=full_url(
                    path=reverse(
                        "comunicat:1.0:order-complete", args=(str(self.order_obj.id),)
                    ),
                    module=self.order_obj.origin_module,
                ),
                amount=self.order_obj.amount.amount.to_integral(
                    rounding=decimal.ROUND_UP
                ),
                currency=str(self.order_obj.amount.currency),
                message=text,
            )

            self.payment_order_obj.external_id = payment.id
            self.payment_order_obj.extra = payment.to_native()

            self.payment_order_obj.save(update_fields=("external_id", "extra"))

            return payment.id
        except HTTPError as e:
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
            result = self.client.get_payment(
                payment_request_id=self.payment_order_obj.external_id,
            )

            if result.status == "PAID":
                return PaymentStatus.COMPLETED
            PaymentStatus.CANCELED
        except HTTPError as e:
            _log.exception(e)

        return PaymentStatus.CANCELED

    def cancel(self, *args, **kwargs) -> bool:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            not self.payment_order_obj
            or self.payment_order_obj.provider.code != "SE_SWISH"
            or not self.payment_order_obj.external_id
        ):
            return True

        try:
            self.client.cancel_payment(
                payment_request_id=self.payment_order_obj.external_id
            )
        except HTTPError:
            pass

        return True

    # TODO SWISH: Fees
    # def fees(self) -> Money:  # noqa: C901
    #     if not self.payment_order_obj.external_id:
    #         return ZERO_MONEY
    #
    #     try:
    #         checkout = self.client.checkouts.get(
    #             checkout_id=self.payment_order_obj.external_id,
    #         )
    #     except APIError as e:
    #         _log.exception(e)
    #         return ZERO_MONEY
    #
    #     if not checkout or not checkout.transactions:
    #         return ZERO_MONEY
    #
    #     transactions = []
    #
    #     for checkout_transaction in checkout.transactions:
    #         if checkout_transaction.status in ("PENDING", "SUCCESSFUL"):
    #             try:
    #                 transaction = self.client.transactions.get(
    #                     id=checkout_transaction.id,
    #                     merchant_code=checkout.merchant_code,
    #                 )
    #                 transactions.append(transaction)
    #             except APIError as e:
    #                 _log.exception(e)
    #
    #     amount_paid = ZERO_MONEY
    #     amount_to_receive = ZERO_MONEY
    #     for transaction in transactions:
    #         amount_paid += Money(transaction.amount, settings.MODULE_ALL_CURRENCY)
    #         for transaction_event in transaction.transaction_events:
    #             transaction_event_money = Money(
    #                 transaction_event.amount, settings.MODULE_ALL_CURRENCY
    #             )
    #             if transaction_event.event_type == "PAYOUT":
    #                 amount_to_receive += transaction_event_money
    #             # TODO: Add test coverage for refunds
    #             # else:
    #             #     amount_to_receive -= transaction_event_money
    #
    #     return max(ZERO_MONEY, amount_paid - amount_to_receive)
