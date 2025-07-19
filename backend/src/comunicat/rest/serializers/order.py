from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s
from versatileimagefield.serializers import VersatileImageFieldSerializer

from comunicat.rest.serializers.data import CountrySerializer, RegionSerializer
from comunicat.rest.serializers.payment import PaymentLineSerializer
from comunicat.rest.serializers.product import ProductSizeSerializer
from comunicat.rest.utils.fields import MoneyField, IntEnumField
from order.enums import OrderDeliveryType, OrderStatus
from order.models import (
    Order,
    OrderDelivery,
    OrderProduct,
    OrderLog,
    DeliveryProvider,
    DeliveryPrice,
)


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


class OrderLogSerializer(s.ModelSerializer):
    class Meta:
        model = OrderLog
        fields = (
            "id",
            "status",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "created_at",
        )


class OrderSerializer(s.ModelSerializer):
    status = IntEnumField(OrderStatus, read_only=True)
    delivery = OrderDeliverySerializer(read_only=True)
    amount = MoneyField(read_only=True)
    products = OrderProductSerializer(many=True, read_only=True)
    logs = OrderLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "delivery",
            "amount",
            "products",
            "logs",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "delivery",
            "amount",
            "products",
            "logs",
            "created_at",
        )


class CreateOrderSizeSerializer(s.Serializer):
    id = s.UUIDField()
    quantity = s.IntegerField(min_value=1, max_value=100)


class CreateCartSerializer(s.Serializer):
    sizes = s.ListSerializer(
        child=CreateOrderSizeSerializer(), min_length=1, max_length=100
    )


class CreateAddressSerializer(s.Serializer):
    street = s.CharField()
    street2 = s.CharField(required=False)
    postcode = s.CharField()
    city = s.CharField()
    country = s.CharField()
    region = s.CharField(required=False)


class CreateDeliverySerializer(s.Serializer):
    address = CreateAddressSerializer()


class CreateOrderSerializer(s.Serializer):
    cart = CreateCartSerializer()
    # delivery = CreateDeliverySerializer()


class DeliveryPriceSerializer(s.ModelSerializer):
    country = CountrySerializer(allow_null=True, read_only=True)
    region = RegionSerializer(allow_null=True, read_only=True)
    max_grams = s.IntegerField(read_only=True)
    price = MoneyField(required=False, read_only=True)
    price_vat = MoneyField(required=False, read_only=True)

    class Meta:
        model = DeliveryPrice
        fields = (
            "id",
            "country",
            "region",
            "max_grams",
            "price",
            "price_vat",
            "created_at",
        )
        read_only_fields = (
            "id",
            "country",
            "region",
            "max_grams",
            "price",
            "price_vat",
            "created_at",
        )


class DeliveryProviderSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    description = s.SerializerMethodField(read_only=True)
    picture = VersatileImageFieldSerializer(
        allow_null=True,
        sizes=[
            ("large", "url"),
            # TODO: Fix this
            ("medium", "url"),
            ("small", "url"),
            # ("medium", "thumbnail__500x500"),
            # ("small", "thumbnail__100x100")
        ],
        read_only=True,
    )
    type = IntEnumField(OrderDeliveryType, read_only=True)
    prices = DeliveryPriceSerializer(many=True, read_only=True)

    class Meta:
        model = DeliveryProvider
        fields = (
            "id",
            "name",
            "description",
            "picture",
            "type",
            "is_enabled",
            "prices",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "picture",
            "type",
            "is_enabled",
            "prices",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())
