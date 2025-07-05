from django.contrib import admin

from order.models import OrderProduct, Order, OrderDelivery


class OrderProductInline(admin.TabularInline):
    model = OrderProduct
    extra = 0
    raw_id_fields = ("line",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    search_fields = ("id", "entity__email", "entity__firstname", "entity__lastname")
    list_display = (
        "entity",
        "delivery",
        "status",
        "created_at",
    )
    raw_id_fields = ("entity",)
    ordering = ("-created_at",)
    inlines = (OrderProductInline,)


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
    ordering = ("-created_at",)
