from rest_framework import serializers as s

from comunicat.rest.serializers.payment import PaymentLineSerializer
from comunicat.rest.serializers.product import ProductSizeSerializer
from comunicat.rest.utils.fields import MoneyField, IntEnumField
from order.enums import OrderDeliveryType, OrderStatus
from order.models import Order, OrderDelivery, OrderProduct


class OrderDeliverySerializer(s.ModelSerializer):
    type = IntEnumField(OrderDeliveryType, read_only=True)

    class Meta:
        model = OrderDelivery
        fields = (
            "id",
            "type",
        )
        read_only_fields = (
            "id",
            "type",
        )


class OrderProductSerializer(s.ModelSerializer):
    size = ProductSizeSerializer(read_only=True)
    line = PaymentLineSerializer(read_only=True)
    amount_unit = MoneyField(read_only=True)
    amount = MoneyField(read_only=True)

    class Meta:
        model = OrderProduct
        fields = (
            "id",
            "size",
            "line",
            "quantity",
            "amount_unit",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "size",
            "line",
            "quantity",
            "amount_unit",
            "amount",
            "vat",
        )


class OrderSerializer(s.ModelSerializer):
    status = IntEnumField(OrderStatus, read_only=True)
    delivery = OrderDeliverySerializer(read_only=True)
    amount = MoneyField(read_only=True)
    products = OrderProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "delivery",
            "amount",
            "products",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "delivery",
            "amount",
            "products",
            "created_at",
        )
