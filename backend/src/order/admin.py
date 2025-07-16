from django.contrib import admin
from django.utils import translation

from notify.enums import EmailType
from order.models import OrderProduct, Order, OrderDelivery, OrderLog

import notify.tasks


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
        notify.tasks.send_order_email(
            order_id=order_obj.id,
            email_type=EmailType.ORDER_CREATED,
            module=order_obj.origin_module,
            locale=order_obj.origin_language,
        )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    search_fields = ("id", "entity__email", "entity__firstname", "entity__lastname")
    list_display = (
        "entity",
        "delivery",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    raw_id_fields = ("entity",)
    ordering = ("-created_at",)
    inlines = (OrderProductInline, OrderLogInline)
    actions = (send_created_email,)


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
        "type",
        "created_at",
    )
    list_filter = ("type", "created_at")
    ordering = ("-created_at",)
