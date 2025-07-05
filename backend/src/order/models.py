from django.db import models
from django.utils import timezone

from comunicat.db.mixins import StandardModel, Timestamps
from djmoney.models.fields import MoneyField

from order.enums import OrderDeliveryType, OrderStatus
from order.managers import OrderQuerySet


class Order(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity",
        null=True,
        blank=True,
        related_name="orders",
        on_delete=models.PROTECT,
    )
    delivery = models.OneToOneField(
        "OrderDelivery",
        related_name="order",
        on_delete=models.PROTECT,
    )

    status = models.PositiveSmallIntegerField(
        choices=((os.value, os.name) for os in OrderStatus),
        default=OrderStatus.CREATED,
    )

    notes = models.TextField(max_length=1000, blank=True, null=True)

    objects = OrderQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{str(self.entity)} - {timezone.localtime(self.created_at).strftime('%Y-%m-%d %H:%M')}"


class OrderDelivery(StandardModel, Timestamps):
    type = models.PositiveSmallIntegerField(
        choices=((odt.value, odt.name) for odt in OrderDeliveryType),
        default=OrderDeliveryType.PICK_UP,
    )

    def __str__(self) -> str:
        if hasattr(self, "order"):
            return f"{str(self.order)} - {OrderDeliveryType(self.type).name}"
        return OrderDeliveryType(self.type).name

    class Meta:
        verbose_name = "order delivery"
        verbose_name_plural = "order deliveries"


class OrderProduct(StandardModel, Timestamps):
    order = models.ForeignKey(
        "Order",
        related_name="products",
        on_delete=models.PROTECT,
    )

    size = models.ForeignKey(
        "product.ProductSize",
        related_name="order_products",
        on_delete=models.PROTECT,
    )

    line = models.OneToOneField(
        "payment.PaymentLine",
        related_name="product",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
    )

    quantity = models.PositiveSmallIntegerField()

    amount_unit = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    amount = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    vat = models.PositiveSmallIntegerField(default=0)
