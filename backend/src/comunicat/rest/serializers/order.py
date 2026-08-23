import re

from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from drf_yasg.utils import swagger_serializer_method
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers as s
from versatileimagefield.serializers import VersatileImageFieldSerializer

from comunicat.rest.serializers.activity import ProgramCourseRegistrationSlimSerializer
from comunicat.rest.serializers.data import (
    CountrySerializer,
    RegionSerializer,
    ZoneSerializer,
)
from comunicat.rest.serializers.event import RegistrationWithEventSerializer
from comunicat.rest.serializers.membership import MembershipModuleSerializer
from comunicat.rest.serializers.payment import (
    PaymentLineSerializer,
    PaymentOrderSerializer,
)
from comunicat.rest.serializers.product import ProductSizeSerializer
from comunicat.rest.utils.fields import IntEnumField, MoneyField
from order.enums import OrderDeliveryType, OrderStatus, OrderType
from order.models import (
    DeliveryDate,
    DeliveryPrice,
    DeliveryProvider,
    Order,
    OrderCourse,
    OrderDelivery,
    OrderLog,
    OrderProduct,
    OrderRegistration,
)
from user.models import User


class DeliveryPriceSerializer(s.ModelSerializer):
    zone = ZoneSerializer(allow_null=True, read_only=True)
    country = CountrySerializer(allow_null=True, read_only=True)
    region = RegionSerializer(allow_null=True, read_only=True)
    max_grams = s.IntegerField(read_only=True)
    price = MoneyField(required=False, read_only=True)
    price_vat = MoneyField(required=False, read_only=True)

    class Meta:
        model = DeliveryPrice
        fields = (
            "id",
            "zone",
            "country",
            "region",
            "max_grams",
            "price",
            "price_vat",
            "created_at",
        )
        read_only_fields = (
            "id",
            "zone",
            "country",
            "region",
            "max_grams",
            "price",
            "price_vat",
            "created_at",
        )


class DeliveryDateSerializer(s.ModelSerializer):
    date = s.DateField(read_only=True)

    class Meta:
        model = DeliveryDate
        fields = (
            "id",
            "date",
        )
        read_only_fields = (
            "id",
            "date",
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
    dates = DeliveryDateSerializer(many=True, required=False, read_only=True)

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
            "dates",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "picture",
            "type",
            "is_enabled",
            "prices",
            "dates",
        )


class OrderDeliverySerializer(s.ModelSerializer):
    provider = DeliveryProviderSlimSerializer()
    amount = MoneyField(read_only=True)

    class Meta:
        model = OrderDelivery
        fields = (
            "id",
            "provider",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "provider",
            "amount",
            "vat",
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
            "quantity_given",
            "amount_unit",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "size",
            "line",
            "quantity",
            "quantity_given",
            "amount_unit",
            "amount",
            "vat",
        )


class OrderRegistrationSerializer(s.ModelSerializer):
    registration = RegistrationWithEventSerializer(read_only=True)
    line = PaymentLineSerializer(read_only=True)
    amount = MoneyField(read_only=True)

    class Meta:
        model = OrderRegistration
        fields = (
            "id",
            "registration",
            "line",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "registration",
            "line",
            "amount",
            "vat",
        )


class OrderMembershipSerializer(s.ModelSerializer):
    module = MembershipModuleSerializer(read_only=True)
    amount = MoneyField(read_only=True)

    class Meta:
        model = OrderRegistration
        fields = (
            "id",
            "module",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "module",
            "amount",
            "vat",
        )


class OrderCourseSerializer(s.ModelSerializer):
    registration = ProgramCourseRegistrationSlimSerializer(read_only=True)
    line = PaymentLineSerializer(read_only=True)
    amount = MoneyField(read_only=True)

    class Meta:
        model = OrderCourse
        fields = (
            "id",
            "registration",
            "line",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "registration",
            "line",
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


class OrderSlimSerializer(s.ModelSerializer):
    status = IntEnumField(OrderStatus, read_only=True)

    class Meta:
        model = Order
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


class OrderSerializer(OrderSlimSerializer):
    delivery = OrderDeliverySerializer(read_only=True)
    payment_order = PaymentOrderSerializer(read_only=True)
    amount = MoneyField(read_only=True)
    amount_vat = MoneyField(read_only=True)
    products = OrderProductSerializer(many=True, read_only=True)
    registrations = OrderRegistrationSerializer(many=True, read_only=True)
    memberships = OrderMembershipSerializer(many=True, read_only=True)
    courses = OrderCourseSerializer(many=True, read_only=True)
    logs = OrderLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "reference",
            "type",
            "status",
            "delivery",
            "payment_order",
            "amount",
            "amount_vat",
            "products",
            "registrations",
            "memberships",
            "courses",
            "logs",
            "created_at",
        )
        read_only_fields = (
            "id",
            "reference",
            "type",
            "status",
            "delivery",
            "payment_order",
            "amount",
            "amount_vat",
            "products",
            "registrations",
            "memberships",
            "logs",
            "created_at",
        )


class CreateOrderSizeSerializer(s.Serializer):
    id = s.UUIDField()
    quantity = s.IntegerField(min_value=1, max_value=100)


class CreateOrderModuleSerializer(s.Serializer):
    id = s.UUIDField()


class CreateOrderCourseRegistrationSerializer(s.Serializer):
    id = s.UUIDField()


class CreateCartSerializer(s.Serializer):
    sizes = s.ListSerializer(
        child=CreateOrderSizeSerializer(),
        min_length=0,
        max_length=100,
        required=False,
    )
    modules = s.ListSerializer(
        child=CreateOrderModuleSerializer(),
        min_length=0,
        max_length=10,
        required=False,
    )
    course_registrations = s.ListSerializer(
        child=CreateOrderCourseRegistrationSerializer(),
        min_length=0,
        max_length=10,
        required=False,
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
    type = IntEnumField(OrderType)
    cart = CreateCartSerializer()
    user = CreateUserDataSerializer(required=False)
    delivery = CreateDeliverySerializer(required=False)
    pickup = CreatePickupSerializer(required=False)

    def __init__(self, user: User | None = None, *args, **kwargs):
        if "data" in kwargs:
            if "delivery" in kwargs["data"]:
                delivery_type = kwargs["data"]["delivery"]["provider"]["type"]
                if delivery_type == OrderDeliveryType.DELIVERY:
                    kwargs["data"].pop("pickup")
                    if "address" not in kwargs["data"]["delivery"]:
                        raise s.ValidationError(
                            {"delivery": {"address": _("This field is required.")}}
                        )
                elif delivery_type == OrderDeliveryType.PICK_UP:
                    kwargs["data"]["delivery"].pop("address")
                    if "pickup" not in kwargs["data"]:
                        raise s.ValidationError(
                            {"pickup": _("This field is required.")}
                        )
                else:
                    kwargs["data"]["delivery"].pop("address")
                    kwargs["data"].pop("pickup")

            if user:
                if "user" in kwargs["data"]:
                    kwargs["data"].pop("user")

        super().__init__(*args, **kwargs)


class UpdateOrderProviderSerializer(s.Serializer):
    provider_id = s.UUIDField()


class CompleteOrderTransactionSerializer(s.Serializer):
    id = s.CharField(required=False)
    reference = s.CharField(required=False)


class CompleteOrderSerializer(s.Serializer):
    date_paid = s.DateTimeField(required=False)
    transaction = CompleteOrderTransactionSerializer(required=False)


class ListOrderSerializer(s.Serializer):
    filter_types = s.ListSerializer(child=IntEnumField(OrderType), required=False)

    def to_internal_value(self, data):
        data = {k: v for k, v in data.items()}
        data["filter_types"] = (
            data["filter_types"].split(",") if data.get("filter_types", False) else []
        )
        data = super().to_internal_value(data)
        return data
