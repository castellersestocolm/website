import logging

from uuid import UUID

from django.conf import settings
from paypalserversdk.models.address import Address
from paypalserversdk.models.fulfillment_type import FulfillmentType

from paypalserversdk.models.order_request import OrderRequest
from paypalserversdk.models.checkout_payment_intent import CheckoutPaymentIntent
from paypalserversdk.models.payee_base import PayeeBase
from paypalserversdk.models.payee_payment_method_preference import (
    PayeePaymentMethodPreference,
)
from paypalserversdk.models.payment_source import PaymentSource
from paypalserversdk.models.paypal_experience_landing_page import (
    PaypalExperienceLandingPage,
)
from paypalserversdk.models.paypal_experience_user_action import (
    PaypalExperienceUserAction,
)
from paypalserversdk.models.paypal_wallet import PaypalWallet
from paypalserversdk.models.paypal_wallet_experience_context import (
    PaypalWalletExperienceContext,
)
from paypalserversdk.models.phone_number_with_country_code import (
    PhoneNumberWithCountryCode,
)
from paypalserversdk.models.purchase_unit_request import PurchaseUnitRequest
from paypalserversdk.models.amount_with_breakdown import AmountWithBreakdown
from paypalserversdk.models.amount_breakdown import AmountBreakdown
from paypalserversdk.models.money import Money as PayPalMoney
from paypalserversdk.models.item import Item
from paypalserversdk.models.item_category import ItemCategory
from paypalserversdk.exceptions.error_exception import ErrorException
from paypalserversdk.exceptions.api_exception import ApiException
from paypalserversdk.http.auth.o_auth_2 import ClientCredentialsAuthCredentials
from paypalserversdk.configuration import Environment
from paypalserversdk.logging.configuration.api_logging_configuration import (
    LoggingConfiguration,
)
from paypalserversdk.logging.configuration.api_logging_configuration import (
    RequestLoggingConfiguration,
)
from paypalserversdk.logging.configuration.api_logging_configuration import (
    ResponseLoggingConfiguration,
)
from paypalserversdk.models.shipping_details import ShippingDetails
from paypalserversdk.models.shipping_name import ShippingName
from paypalserversdk.models.shipping_preference import ShippingPreference
from paypalserversdk.paypal_serversdk_client import PaypalServersdkClient

from comunicat.template_tags.comunicat_tags import full_media
from order.enums import OrderStatus, OrderDeliveryType
from payment.api.provider import PaymentProviderBase
from payment.enums import PaymentStatus

_log = logging.getLogger(__name__)


DELIVERY_TYPE_TO_PAYPAL_FULFILLMENT_TYPE = {
    OrderDeliveryType.PICK_UP: FulfillmentType.PICKUP_IN_STORE,
    OrderDeliveryType.IN_PERSON: FulfillmentType.PICKUP_IN_STORE,
    OrderDeliveryType.DELIVERY: FulfillmentType.SHIPPING,
}


class PaymentProviderPaypal(PaymentProviderBase):
    client: PaypalServersdkClient

    def __init__(self, order_id: UUID):
        super().__init__(order_id=order_id)

        self.client = PaypalServersdkClient(
            client_credentials_auth_credentials=ClientCredentialsAuthCredentials(
                o_auth_client_id=settings.PAYMENT_PROVIDER_PAYPAL_CLIENT_ID,
                o_auth_client_secret=settings.PAYMENT_PROVIDER_PAYPAL_CLIENT_SECRET,
            ),
            environment=Environment[settings.PAYMENT_PROVIDER_PAYPAL_ENVIRONMENT],
            logging_configuration=LoggingConfiguration(
                log_level=logging.INFO,
                request_logging_config=RequestLoggingConfiguration(log_body=True),
                response_logging_config=ResponseLoggingConfiguration(log_headers=True),
            ),
        )

    def create(self) -> str | None:
        assert self.order_obj.status == OrderStatus.CREATED

        if (
            self.payment_order_obj.status == PaymentStatus.PROCESSING
            and self.payment_order_obj.external_id
        ):
            return None

        orders_controller = self.client.orders
        collect = {
            "body": OrderRequest(
                intent=CheckoutPaymentIntent.CAPTURE,
                purchase_units=[
                    PurchaseUnitRequest(
                        amount=AmountWithBreakdown(
                            currency_code=str(self.order_obj.amount.currency),
                            value="{0:.2f}".format(self.order_obj.amount.amount),
                            breakdown=AmountBreakdown(
                                item_total=PayPalMoney(
                                    currency_code=str(
                                        self.order_obj.amount_products.currency
                                    ),
                                    value="{0:.2f}".format(
                                        self.order_obj.amount_products.amount
                                    ),
                                ),
                                shipping=PayPalMoney(
                                    currency_code="SEK", value="{0:.2f}".format(0)
                                ),
                            ),
                        ),
                        payee=PayeeBase(
                            email_address=self.entity_obj.email,
                        ),
                        shipping=ShippingDetails(
                            mtype=DELIVERY_TYPE_TO_PAYPAL_FULFILLMENT_TYPE[
                                self.order_delivery_obj.provider.type
                            ],
                            name=ShippingName(full_name=self.entity_obj.full_name),
                            email_address=self.entity_obj.email,
                            **(
                                {
                                    "phone_number": PhoneNumberWithCountryCode(
                                        country_code=self.entity_obj.phone_country_code,
                                        national_number=self.entity_obj.phone_national_number,
                                    )
                                }
                                if self.entity_obj.phone
                                else {}
                            ),
                            **(
                                {
                                    "address": Address(
                                        address_line_1=self.order_delivery_obj.address.address,
                                        address_line_2=self.order_delivery_obj.address.address2,
                                        postal_code=self.order_delivery_obj.address.postcode,
                                        # TODO: Fix Catalan mapping
                                        country_code=self.order_delivery_obj.address.country.code,
                                    )
                                }
                                if self.order_delivery_obj.provider.type
                                == OrderDeliveryType.DELIVERY
                                else {}
                            ),
                        ),
                        invoice_id=self.order_obj.reference,
                        items=[
                            Item(
                                name=order_product_obj.name_locale,
                                unit_amount=PayPalMoney(
                                    currency_code=str(
                                        order_product_obj.amount_unit.currency
                                    ),
                                    value="{0:.2f}".format(
                                        order_product_obj.amount_unit.amount
                                    ),
                                ),
                                quantity=str(order_product_obj.quantity),
                                description=order_product_obj.description_locale,
                                # sku='sku01',
                                # url='https://example.com/url-to-the-item-being-purchased-1',
                                category=ItemCategory.PHYSICAL_GOODS,
                                **(
                                    {
                                        "image_url": full_media(
                                            path=order_product_obj.size.product.images.first().picture.url
                                        )
                                    }
                                    if not settings.DEBUG
                                    and order_product_obj.size.product.images.exists()
                                    else {}
                                ),
                                # upc=UniversalProductCode(
                                #     mtype=UpcType.UPC_A,
                                #     code='123456789012'
                                # )
                            )
                            for order_product_obj in self.order_obj.products.all()
                        ],
                    )
                ],
                payment_source=PaymentSource(
                    paypal=PaypalWallet(
                        experience_context=PaypalWalletExperienceContext(
                            shipping_preference=(
                                ShippingPreference.SET_PROVIDED_ADDRESS
                                if self.order_delivery_obj.provider.type
                                == OrderDeliveryType.DELIVERY
                                else ShippingPreference.NO_SHIPPING
                            ),
                            return_url="https://example.com/returnUrl",
                            cancel_url="https://example.com/cancelUrl",
                            landing_page=PaypalExperienceLandingPage.LOGIN,
                            user_action=PaypalExperienceUserAction.PAY_NOW,
                            payment_method_preference=PayeePaymentMethodPreference.IMMEDIATE_PAYMENT_REQUIRED,
                        )
                    )
                ),
            )
        }
        try:
            result = orders_controller.create_order(collect)

            if result.status_code not in (200, 201):
                return None

            return result.body.id

        except ErrorException as e:
            _log.exception(e)
        except ApiException as e:
            _log.exception(e)

        return None
