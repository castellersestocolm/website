from django.core.exceptions import ValidationError
from django.db.models import JSONField
from django.utils import translation
from versatileimagefield.fields import VersatileImageField

from comunicat.db.mixins import StandardModel, Timestamps
from comunicat.enums import Module
from comunicat.utils.models import language_field_default
from django.db import models
from djmoney.models.fields import MoneyField

from product.enums import ArticleType, ArticleSizeCategory

from django.utils.translation import gettext_lazy as _

from product.managers import ProductQuerySet, ProductSizeQuerySet


class Product(StandardModel, Timestamps):
    name = JSONField(default=language_field_default)
    description = JSONField(default=language_field_default)
    type = models.PositiveSmallIntegerField(
        choices=((at.value, at.name) for at in ArticleType),
    )

    objects = ProductQuerySet.as_manager()

    def __str__(self) -> str:
        return self.name.get(translation.get_language()) or list(self.name.values())[0]

    class Meta:
        ordering = ("type", "created_at")


class ProductSize(StandardModel, Timestamps):
    product = models.ForeignKey(
        "Product",
        related_name="sizes",
        on_delete=models.CASCADE,
    )
    category = models.PositiveSmallIntegerField(
        choices=((asc.value, asc.name) for asc in ArticleSizeCategory),
        null=True,
        blank=True,
    )
    size = models.CharField(max_length=32)
    order = models.PositiveSmallIntegerField(default=0)

    objects = ProductSizeQuerySet.as_manager()

    def __str__(self) -> str:
        return f"{str(self.product)} - {self.size}"

    class Meta:
        ordering = ("product__type", "order", "category", "size")


class ProductImage(StandardModel, Timestamps):
    product = models.ForeignKey(
        "Product",
        related_name="images",
        on_delete=models.CASCADE,
    )

    picture = VersatileImageField("Image", upload_to="product/image/picture/")

    def __str__(self) -> str:
        return f"{str(self.product)} <{self.picture.name}>"


class ProductPrice(StandardModel, Timestamps):
    product = models.ForeignKey(
        "Product",
        related_name="prices",
        on_delete=models.CASCADE,
    )

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module),
        null=True,
        blank=True,
    )

    size = models.ForeignKey(
        "ProductSize",
        null=True,
        blank=True,
        related_name="prices",
        on_delete=models.CASCADE,
    )

    amount = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    vat = models.PositiveSmallIntegerField(default=0)

    def clean(self):
        if self.size and self.product != self.size.product:
            raise ValidationError({"size": _("Product size must match product.")})

    class Meta:
        ordering = ("product__type", "module")


class StockOrder(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "payment.Entity",
        null=True,
        blank=True,
        related_name="stock_orders",
        on_delete=models.PROTECT,
    )

    date_made = models.DateField(blank=True, null=True)
    date_available = models.DateField(blank=True, null=True)

    receipt = models.ForeignKey(
        "payment.Receipt",
        related_name="stock_orders",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )


class StockProduct(StandardModel, Timestamps):
    order = models.ForeignKey(
        "StockOrder",
        related_name="articles",
        on_delete=models.PROTECT,
    )
    size = models.ForeignKey(
        "ProductSize",
        related_name="stocks",
        on_delete=models.PROTECT,
    )

    amount = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ("size__product__type", "size__category", "size__size")
