import re

from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from phonenumber_field.serializerfields import PhoneNumberField
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

from django.utils.translation import gettext_lazy as _

from user.models import User


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


class DeliveryProviderSlimSerializer(s.ModelSerializer):
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

    class Meta:
        model = DeliveryProvider
        fields = (
            "id",
            "name",
            "description",
            "picture",
            "type",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "picture",
            "type",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())


class DeliveryProviderSerializer(DeliveryProviderSlimSerializer):
    prices = DeliveryPriceSerializer(many=True, required=False, read_only=True)

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


class OrderDeliverySerializer(s.ModelSerializer):
    provider = DeliveryProviderSlimSerializer()

    class Meta:
        model = OrderDelivery
        fields = (
            "id",
            "provider",
        )
        read_only_fields = (
            "id",
            "provider",
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
    address = s.CharField(max_length=255)
    apartment = s.CharField(
        max_length=10, allow_null=True, allow_blank=True, required=False
    )
    address2 = s.CharField(allow_null=True, allow_blank=True, required=False)
    postcode = s.CharField(min_length=1, max_length=10)
    city = s.CharField(max_length=255)
    country = s.CharField(max_length=10)
    region = s.CharField(allow_null=True, allow_blank=True, required=False)


class CreateDeliveryProviderSerializer(s.Serializer):
    id = s.UUIDField()
    type = IntEnumField(OrderDeliveryType)


class CreateDeliverySerializer(s.Serializer):
    address = CreateAddressSerializer(required=False)
    provider = CreateDeliveryProviderSerializer()


class CreatePickupSerializer(s.Serializer):
    event_id = s.UUIDField()


class CreateUserDataSerializer(s.Serializer):
    firstname = s.CharField(required=True)
    lastname = s.CharField(required=True)
    email = s.EmailField(required=True)
    phone = PhoneNumberField(required="phone" in settings.MODULE_ALL_USER_FIELDS)

    def validate_email(self, value: str):
        email = BaseUserManager.normalize_email(value)
        return re.sub(r"^([^+]*)(\+.*)?(@.*)$", r"\1\3", email)


class CreateOrderSerializer(s.Serializer):
    cart = CreateCartSerializer()
    user = CreateUserDataSerializer(required=False)
    delivery = CreateDeliverySerializer()
    pickup = CreatePickupSerializer(required=False)

    def __init__(self, user: User | None = None, *args, **kwargs):
        delivery_type = kwargs["data"]["delivery"]["provider"]["type"]
        if delivery_type == OrderDeliveryType.DELIVERY:
            kwargs["data"].pop("pickup")
            if not "address" in kwargs["data"]["delivery"]:
                raise s.ValidationError(
                    {"delivery": {"address": _("This field is required.")}}
                )
        elif delivery_type == OrderDeliveryType.PICK_UP:
            kwargs["data"]["delivery"].pop("address")
            if not "pickup" in kwargs["data"]:
                raise s.ValidationError({"pickup": _("This field is required.")})
        else:
            kwargs["data"]["delivery"].pop("address")
            kwargs["data"].pop("pickup")

        if user:
            kwargs["data"].pop("user")

        super().__init__(*args, **kwargs)
