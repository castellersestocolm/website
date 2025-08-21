from django.contrib import admin
from django.db.models import JSONField
from django.utils import translation
from jsoneditor.forms import JSONEditor

from notify.enums import EmailType
from order.enums import OrderDeliveryType
from order.models import (
    OrderProduct,
    Order,
    OrderDelivery,
    OrderLog,
    DeliveryProvider,
    DeliveryPrice,
    OrderDeliveryAddress,
    DeliveryDate,
)

import notify.tasks

from django.utils.translation import gettext_lazy as _

from payment.enums import PaymentType


class OrderProductInline(admin.TabularInline):
    model = OrderProduct
    extra = 0
    raw_id_fields = ("line",)


class OrderLogInline(admin.TabularInline):
    model = OrderLog
    readonly_fields = ("status", "created_at")
    ordering = ("-created_at",)
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.action(description="Send created email")
def send_created_email(modeladmin, request, queryset):
    for order_obj in queryset:
        notify.tasks.send_order_email.delay(
            order_id=order_obj.id,
            email_type=EmailType.ORDER_CREATED,
            module=order_obj.origin_module,
            locale=order_obj.origin_language,
        )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "reference",
        "entity__email",
        "entity__firstname",
        "entity__lastname",
    )
    list_display = (
        "reference",
        "entity",
        "notes",
        "delivery_type",
        "payment_type",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    raw_id_fields = ("entity",)
    ordering = ("-created_at",)
    inlines = (OrderProductInline, OrderLogInline)
    actions = (send_created_email,)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "delivery",
                "delivery__provider",
                "payment_order",
                "payment_order__provider",
            )
        )

    def delivery_type(self, obj):
        return (
            OrderDeliveryType(obj.delivery.provider.type).name if obj.delivery else "-"
        )

    def payment_type(self, obj):
        if not obj.payment_order:
            return "-"

        payment_provider_obj = obj.payment_order.provider
        return (
            payment_provider_obj.name.get(translation.get_language())
            or list(payment_provider_obj.name.values())[0]
        )

    delivery_type.short_description = _("delivery")
    payment_type.short_description = _("payment")


@admin.register(OrderDelivery)
class OrderDeliveryAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "order__entity__email",
        "order__entity__firstname",
        "order__entity__lastname",
    )
    list_display = (
        "order",
        "provider",
        "created_at",
    )
    list_filter = ("provider__type", "created_at")
    raw_id_fields = ("address", "event")
    ordering = ("-created_at",)


@admin.register(OrderDeliveryAddress)
class OrderDeliveryAddressAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "address",
        "apartment",
        "address2",
        "postcode",
        "city",
        "country__name",
        "region__name",
    )
    list_display = (
        "address",
        "apartment",
        "postcode",
        "city",
        "country",
        "region",
    )
    list_filter = (
        "country",
        "region",
        "created_at",
    )
    ordering = ("-created_at",)


class DeliveryPriceInline(admin.TabularInline):
    model = DeliveryPrice
    extra = 0
    raw_id_fields = ("country", "region")


class DeliveryDateInline(admin.TabularInline):
    model = DeliveryDate
    extra = 0
    ordering = ("-date",)


@admin.register(DeliveryProvider)
class DeliveryProviderAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    list_display = ("name_locale",)
    list_filter = ("type", "created_at")
    ordering = (
        "type",
        "-created_at",
    )
    inlines = (DeliveryPriceInline, DeliveryDateInline)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    name_locale.short_description = _("name")
