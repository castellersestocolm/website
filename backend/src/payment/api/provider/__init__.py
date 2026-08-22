from uuid import UUID

from django.db.models import Prefetch
from djmoney.money import Money

from comunicat.consts import ZERO_MONEY
from order.models import Order, OrderDelivery, OrderProduct
from payment.enums import PaymentStatus
from payment.models import Entity, PaymentOrder, PaymentProvider


class PaymentProviderBase:
    provider_obj: PaymentProvider
    order_obj: Order
    entity_obj: Entity
    order_delivery_obj: OrderDelivery
    payment_order_obj: PaymentOrder | None = None

    def __init__(self, order_id: UUID):
        self.order_obj = (
            Order.objects.filter(id=order_id)
            .select_related(
                "entity",
                "delivery",
                "delivery__provider",
                "delivery__address",
                "delivery__address__country",
                "delivery__address__region",
            )
            .prefetch_related(
                Prefetch(
                    "products",
                    OrderProduct.objects.order_by(
                        "size__product__type",
                        "size__order",
                        "size__category",
                        "size__size",
                    )
                    .select_related("size", "size__product", "line")
                    .prefetch_related("size__product__images")
                    .with_name()
                    .with_description(),
                ),
            )
            .with_amount()
            .first()
        )

        assert self.order_obj is not None
        assert self.order_obj.entity is not None
        assert self.order_obj.payment_order is not None
        assert self.order_obj.payment_order.provider is not None

        self.entity_obj = self.order_obj.entity
        self.order_delivery_obj = self.order_obj.delivery
        self.payment_order_obj = self.order_obj.payment_order
        self.provider_obj = self.payment_order_obj.provider

    def create(self, *args, **kwargs) -> str | None:
        return None

    def capture(self, *args, **kwargs) -> PaymentStatus:
        return PaymentStatus.CANCELED

    def refund(self, *args, **kwargs) -> PaymentStatus:
        return PaymentStatus.CANCELED

    def cancel(self, *args, **kwargs) -> bool:
        return False

    def fees(self, *args, **kwargs) -> Money:
        return ZERO_MONEY
