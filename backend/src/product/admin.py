from django.contrib import admin
from django.db.models import JSONField
from django.utils import translation
from jsoneditor.forms import JSONEditor

from django.utils.translation import gettext_lazy as _

from product.models import (
    ProductSize,
    ProductImage,
    Product,
    ProductPrice,
    StockOrder,
    StockProduct,
)


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 0
    fields = ("category", "size", "stock")
    readonly_fields = ("stock",)

    def get_queryset(self, request):
        return super().get_queryset(request).with_stock()

    def stock(self, obj):
        return obj.stock

    stock.short_description = _("stock")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


class ProductPriceInline(admin.TabularInline):
    model = ProductPrice
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name_locale",
        "type",
        "stock",
        "created_at",
    )
    list_filter = ("type", "created_at")
    readonly_fields = ("stock",)
    ordering = ("type", "created_at")
    inlines = (ProductSizeInline, ProductPriceInline, ProductImageInline)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .with_stock()
            .prefetch_related("sizes", "images", "prices")
        )

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    def stock(self, obj):
        return obj.stock

    name_locale.short_description = _("name")
    stock.short_description = _("stock")


class StockProductInline(admin.TabularInline):
    model = StockProduct
    extra = 0


@admin.register(StockOrder)
class StockOrderAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "date_made",
        "date_available",
        "created_at",
    )
    list_filter = ("date_made", "date_available", "created_at")
    ordering = ("-created_at",)
    inlines = (StockProductInline,)
