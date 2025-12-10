from drf_yasg.utils import swagger_serializer_method

from comunicat.enums import Module
from comunicat.rest.serializers.event import EventModuleSerializer, LocationSerializer
from comunicat.rest.serializers.legal import TeamSlimSerializer, RoleSerializer
from comunicat.rest.serializers.order import OrderProductSerializer
from comunicat.rest.serializers.product import ProductSerializer
from comunicat.rest.serializers.towers import TowerWithPlacesSerializer
from comunicat.rest.serializers.user import (
    UserExtraSlimWithFamilySerializer,
    UserSuperSlimSerializer,
)
from rest_framework import serializers as s

from comunicat.rest.utils.fields import IntEnumField, MoneyField
from event.models import Event
from legal.models import Member
from membership.enums import MembershipStatus
from order.enums import OrderStatus
from order.models import Order
from payment.models import Entity
from user.enums import UserProductSource
from user.models import User, TowersUser


class AdminMembershipSerializer(s.Serializer):
    id = s.UUIDField(read_only=True)
    status = IntEnumField(MembershipStatus, read_only=True)
    date_to = s.DateField(read_only=True)
    modules = s.ListSerializer(
        child=IntEnumField(Module, read_only=True), read_only=True
    )


class AdminEntitySerializer(s.ModelSerializer):
    user = UserSuperSlimSerializer(required=False, read_only=True)

    class Meta:
        model = Entity
        fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "user",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "user",
        )


class AdminOrderSlimSerializer(s.ModelSerializer):
    status = IntEnumField(OrderStatus, read_only=True)
    products = OrderProductSerializer(many=True, read_only=True)
    amount = MoneyField(read_only=True)
    amount_vat = MoneyField(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "products",
            "amount",
            "amount_vat",
        )
        read_only_fields = (
            "id",
            "status",
            "products",
            "amount",
            "amount_vat",
        )


class AdminOrderSerializer(AdminOrderSlimSerializer):
    entity = AdminEntitySerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "entity",
            "status",
            "products",
            "amount",
            "amount_vat",
        )
        read_only_fields = (
            "id",
            "entity",
            "status",
            "products",
            "amount",
            "amount_vat",
        )


class AdminUserProductSerializer(s.Serializer):
    product = ProductSerializer(read_only=True)
    source = IntEnumField(UserProductSource, read_only=True)


class AdminMemberSerializer(s.ModelSerializer):
    team = TeamSlimSerializer(read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = Member
        fields = (
            "id",
            "team",
            "role",
            "picture",
            "created_at",
        )
        read_only_fields = (
            "id",
            "team",
            "role",
            "picture",
            "created_at",
        )


class AdminUserSerializer(UserExtraSlimWithFamilySerializer):
    membership = s.SerializerMethodField(read_only=True)
    orders = AdminOrderSlimSerializer(many=True, source="entity.orders", read_only=True)
    members = AdminMemberSerializer(many=True, read_only=True)
    products = AdminUserProductSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "firstname",
            "lastname",
            "can_manage",
            "membership",
            "family",
            "towers",
            "orders",
            "members",
            "products",
            "created_at",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "can_manage",
            "membership",
            "family",
            "towers",
            "orders",
            "members",
            "products",
            "created_at",
        )

    @swagger_serializer_method(
        serializer_or_field=AdminMembershipSerializer(read_only=True)
    )
    def get_membership(self, obj):
        return (
            AdminMembershipSerializer(
                {
                    "id": obj.membership_id,
                    "status": obj.membership_status,
                    "date_to": obj.membership_date_to,
                    "modules": [
                        module
                        for module in Module
                        if getattr(obj, f"membership_{module}")
                    ],
                }
            ).data
            if obj.membership_id
            else None
        )


class AdminTowersUserRequestSerializer(s.ModelSerializer):
    alias = s.CharField(required=False)
    height_shoulders = s.IntegerField(min_value=0, max_value=200, required=False)
    height_arms = s.IntegerField(min_value=0, max_value=250, required=False)

    class Meta:
        model = TowersUser
        fields = ("alias", "height_shoulders", "height_arms")


class AdminUserRequestSerializer(s.ModelSerializer):
    towers = AdminTowersUserRequestSerializer(required=False)

    class Meta:
        model = User
        fields = ("towers",)


class AdminListEventSerializer(s.Serializer):
    date_from = s.DateField(required=False)
    date_to = s.DateField(required=False)


class AdminEventSerializer(s.ModelSerializer):
    location = LocationSerializer(read_only=True)
    require_signup = s.BooleanField(read_only=True)
    require_approve = s.BooleanField(read_only=True)
    modules = EventModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "time_from",
            "time_to",
            "location",
            "type",
            "module",
            "require_signup",
            "require_approve",
            "modules",
            "created_at",
        )
        read_only_fields = (
            "id",
            "title",
            "time_from",
            "time_to",
            "location",
            "type",
            "module",
            "require_signup",
            "require_approve",
            "modules",
            "created_at",
        )


class AdminTowersEventSerializer(s.Serializer):
    towers = TowerWithPlacesSerializer(many=True, read_only=True)
