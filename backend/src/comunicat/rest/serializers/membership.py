from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.enums import Module
from comunicat.rest.utils.fields import IntEnumField, MoneyField
from membership.enums import MembershipStatus
from membership.models import Membership, MembershipModule


class MembershipModuleSerializer(s.ModelSerializer):
    status = s.SerializerMethodField(read_only=True)
    amount = MoneyField(read_only=True)

    @swagger_serializer_method(
        serializer_or_field=IntEnumField(MembershipStatus, read_only=True)
    )
    def get_status(self, obj):
        if obj.membership.is_active:
            return obj.status
        return MembershipStatus.EXPIRED

    class Meta:
        model = MembershipModule
        fields = (
            "id",
            "status",
            "amount",
            "module",
        )
        read_only_fields = (
            "id",
            "status",
            "amount",
            "module",
        )


class MembershipSerializer(s.ModelSerializer):
    status = s.SerializerMethodField(read_only=True)
    amount = MoneyField(read_only=True)
    modules = MembershipModuleSerializer(many=True, read_only=True)

    @swagger_serializer_method(
        serializer_or_field=IntEnumField(MembershipStatus, read_only=True)
    )
    def get_status(self, obj):
        if obj.is_active:
            return obj.status
        return MembershipStatus.EXPIRED

    class Meta:
        model = Membership
        fields = (
            "id",
            "status",
            "amount",
            "date_from",
            "date_to",
            "date_renewal",
            "is_active",
            "can_renew",
            "modules",
        )
        read_only_fields = (
            "id",
            "status",
            "amount",
            "date_from",
            "date_to",
            "date_renewal",
            "is_active",
            "can_renew",
            "modules",
        )


class MembershipRenewOptionSerializer(s.Serializer):
    amount = MoneyField(read_only=True)
    module = IntEnumField(Module, read_only=True)


class MembershipRenewSerializer(s.Serializer):
    modules = MembershipRenewOptionSerializer(many=True, read_only=True)
    amount = MoneyField(read_only=True)
    date_to = s.DateField(read_only=True)


class MembershipRenewRequestSerializer(s.Serializer):
    modules = s.ListSerializer(child=IntEnumField(Module))


class ListMembershipSerializer(s.Serializer):
    filter_status = s.ListSerializer(
        child=IntEnumField(MembershipStatus), required=False
    )

    def to_internal_value(self, data):
        data = {k: v for k, v in data.items()}
        data["filter_status"] = (
            data["filter_status"].split(",") if data.get("filter_status", False) else []
        )
        data = super().to_internal_value(data)
        return data
