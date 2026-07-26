from django import forms
from django.contrib import admin
from django.db.models import JSONField
from django.urls import reverse
from django.utils import translation
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from jsoneditor.forms import JSONEditor

from payment.enums import PaymentType
from payment.models import Account
from product.models import (
    Product,
    ProductAccounts,
    ProductImage,
    ProductModule,
    ProductPrice,
    ProductSize,
    StockOrder,
    StockProduct,
)


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 0
    fields = ("category", "size", "order", "stock")
    readonly_fields = ("stock",)

    def get_queryset(self, request):
        return super().get_queryset(request).with_stock()

    def stock(self, obj):
        if not obj.stock_in_pending:
            return obj.stock
        return f"{obj.stock} (+{obj.stock_in_pending})"

    stock.short_description = _("stock")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


class ProductPriceInline(admin.TabularInline):
    model = ProductPrice
    extra = 0


class ProductModuleInline(admin.TabularInline):
    model = ProductModule
    ordering = ("module",)
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name_locale",
        "type",
        "weight_grams",
        "stock",
        "created_at",
    )
    list_filter = ("type", "weight_grams", "created_at")
    readonly_fields = (
        "accounts_link",
        "stock",
    )
    ordering = ("type", "created_at")
    inlines = (
        ProductSizeInline,
        ProductPriceInline,
        ProductImageInline,
        ProductModuleInline,
    )

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

    def accounts_link(self, obj):
        if hasattr(obj, "accounts"):
            product_accounts_link = reverse(
                "admin:product_productaccounts_change", args=(obj.accounts.id,)
            )
            return mark_safe(f'<a href="{product_accounts_link}">{obj.accounts}</a>')
        return "-"

    def stock(self, obj):
        if not obj.stock_in_pending:
            return obj.stock
        return f"{obj.stock} (+{obj.stock_in_pending})"

    name_locale.short_description = _("name")
    accounts_link.short_description = _("accounts")
    stock.short_description = _("stock")


class StockProductInline(admin.TabularInline):
    model = StockProduct
    extra = 0


class ProductAccountsForm(forms.ModelForm):
    class Meta:
        model = ProductAccounts
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["payment_debit"].queryset = Account.objects.filter(
            type=PaymentType.DEBIT, allow_transactions=True
        ).order_by("code")
        self.fields["payment_credit"].queryset = Account.objects.filter(
            type=PaymentType.CREDIT, allow_transactions=True
        ).order_by("code")
        self.fields["stock_order"].queryset = Account.objects.filter(
            type=PaymentType.CREDIT, allow_transactions=True
        ).order_by("code")


@admin.register(ProductAccounts)
class ProductAccountsAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "product",
        "created_at",
    )
    list_filter = ("created_at",)
    ordering = ("-created_at",)
    form = ProductAccountsForm


@admin.register(StockOrder)
class StockOrderAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "entity",
        "date_made",
        "date_available",
        "receipt",
        "created_at",
    )
    list_filter = ("date_made", "date_available", "created_at")
    raw_id_fields = (
        "entity",
        "receipt",
    )
    ordering = (
        "-date_made",
        "-created_at",
    )
    inlines = (StockProductInline,)
