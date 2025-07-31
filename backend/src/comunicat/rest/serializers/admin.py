from drf_yasg.utils import swagger_serializer_method

from comunicat.enums import Module
from comunicat.rest.serializers.user import UserExtraSlimWithFamilySerializer
from rest_framework import serializers as s

from comunicat.rest.utils.fields import IntEnumField
from membership.enums import MembershipStatus
from user.models import User


class AdminMembershipSerializer(s.Serializer):
    id = s.UUIDField(read_only=True)
    status = IntEnumField(MembershipStatus, read_only=True)
    date_to = s.DateField(read_only=True)
    modules = s.ListSerializer(
        child=IntEnumField(Module, read_only=True), read_only=True
    )


class AdminUserSerializer(UserExtraSlimWithFamilySerializer):
    membership = s.SerializerMethodField(read_only=True)

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
