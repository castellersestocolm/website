from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import JSONField
from django.utils import timezone, translation
from versatileimagefield.fields import VersatileImageField

from comunicat.db.mixins import StandardModel, Timestamps
from djmoney.models.fields import MoneyField

from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from order.enums import OrderDeliveryType, OrderStatus
from order.managers import OrderQuerySet, DeliveryPriceQuerySet

from django.utils.translation import gettext_lazy as _


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

    # Tracks where the order was created
    origin_module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
    )
    origin_language = models.CharField(max_length=255, null=True, blank=True)

    objects = OrderQuerySet.as_manager()

    __status = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__status = self.status

    def __str__(self) -> str:
        return f"{str(self.entity)} - {timezone.localtime(self.created_at).strftime('%Y-%m-%d %H:%M')}"

    def save(self, *args, **kwargs):
        if self.pk and self.status != self.__status:
            OrderLog.objects.create(order_id=self.id, status=self.status)
        super().save(*args, **kwargs)


class OrderLog(StandardModel, Timestamps):
    order = models.ForeignKey(
        "Order",
        related_name="logs",
        on_delete=models.CASCADE,
    )
    status = models.PositiveSmallIntegerField(
        choices=((os.value, os.name) for os in OrderStatus),
    )


class OrderDeliveryAddress(StandardModel, Timestamps):
    address = models.CharField(max_length=255)
    apartment = models.CharField(max_length=10, null=True, blank=True)
    address2 = models.CharField(max_length=255, null=True, blank=True)

    postcode = models.CharField(max_length=10)
    city = models.CharField(max_length=255)

    country = models.ForeignKey(
        "data.Country",
        related_name="delivery_addresses",
        on_delete=models.PROTECT,
    )

    region = models.ForeignKey(
        "data.Region",
        related_name="delivery_addresses",
        on_delete=models.PROTECT,
    )

    def __str__(self) -> str:
        return f"{self.address}{' ' + self.apartment if self.apartment else ''} - {self.postcode} {self.city} - {self.country.name.get(translation.get_language()) or list(self.country.name.values())[0]}"

    class Meta:
        verbose_name = "address"
        verbose_name_plural = "addresses"


class OrderDelivery(StandardModel, Timestamps):
    provider = models.ForeignKey(
        "DeliveryProvider",
        related_name="deliveries",
        on_delete=models.CASCADE,
    )
    address = models.OneToOneField(
        "OrderDeliveryAddress",
        related_name="delivery",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    event = models.ForeignKey(
        "event.Event",
        related_name="deliveries",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    def __str__(self) -> str:
        if hasattr(self, "order"):
            return f"{str(self.order)} - {self.provider}"
        return str(self.provider)

    class Meta:
        verbose_name = "order delivery"
        verbose_name_plural = "order deliveries"


class OrderProduct(StandardModel, Timestamps):
    order = models.ForeignKey(
        "Order",
        related_name="products",
        on_delete=models.CASCADE,
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


class DeliveryProvider(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)

    picture = VersatileImageField(
        "Image", blank=True, null=True, upload_to="order/deliver-provider/picture/"
    )

    type = models.PositiveSmallIntegerField(
        choices=((odt.value, odt.name) for odt in OrderDeliveryType),
    )

    is_enabled = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]


class DeliveryPrice(StandardModel, Timestamps):
    provider = models.ForeignKey(
        DeliveryProvider, related_name="prices", on_delete=models.CASCADE
    )

    country = models.ForeignKey(
        "data.Country",
        related_name="delivery_prices",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    region = models.ForeignKey(
        "data.Region",
        related_name="delivery_prices",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    max_grams = models.PositiveSmallIntegerField(blank=True, null=True)

    price = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    vat = models.PositiveSmallIntegerField(default=0)

    objects = DeliveryPriceQuerySet.as_manager()

    def clean(self):
        if self.country and self.region and self.country != self.region.country:
            raise ValidationError({"size": _("Region's country must match country.")})

    class Meta:
        ordering = ("price", "max_grams")
