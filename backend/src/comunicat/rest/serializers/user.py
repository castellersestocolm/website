import datetime
import re

from django.contrib.auth.base_user import BaseUserManager
from drf_yasg.utils import swagger_serializer_method
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers as s
from rest_framework.exceptions import ValidationError

from comunicat.rest.utils.fields import IntEnumField, EnumField
from legal.enums import PermissionLevel
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.models import User, TowersUser, Family, FamilyMember, FamilyMemberRequest
from django.conf import settings

from django.utils.translation import gettext_lazy as _

from user.utils import is_over_minimum_age


class TowersUserSerializer(s.ModelSerializer):
    class Meta:
        model = TowersUser
        fields = ("id", "height_shoulders", "height_arms")
        read_only_fields = ("id", "height_shoulders", "height_arms")


class UserExtraSlimSerializer(s.ModelSerializer):
    towers = TowersUserSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "firstname",
            "lastname",
            "can_manage",
            "towers",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "can_manage",
            "towers",
        )


class UserSlimSerializer(UserExtraSlimSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "birthday",
            "consent_pictures",
            "preferred_language",
            "can_manage",
            "towers",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "birthday",
            "consent_pictures",
            "preferred_language",
            "can_manage",
            "towers",
        )


class FamilyMemberSerializer(s.ModelSerializer):
    user = s.SerializerMethodField(read_only=True)
    role = IntEnumField(FamilyMemberRole, read_only=True)
    status = IntEnumField(FamilyMemberStatus, read_only=True)

    @swagger_serializer_method(serializer_or_field=UserSlimSerializer(read_only=True))
    def get_user(self, obj):
        if (
            obj.user.can_manage
            or "user" in self.context
            and not self.context["user"].is_authenticated
        ):
            return UserExtraSlimSerializer(obj.user).data
        return UserSlimSerializer(obj.user).data

    class Meta:
        model = FamilyMember
        fields = ("id", "user", "role", "status", "created_at")
        read_only_fields = ("id", "user", "role", "status", "created_at")


class ListFamilySerializer(s.Serializer):
    token = s.CharField(required=False)


class FamilySerializer(s.ModelSerializer):
    members = FamilyMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Family
        fields = ("id", "members", "created_at")
        read_only_fields = ("id", "members", "created_at")


class UserSerializer(UserSlimSerializer):
    family = FamilySerializer(
        read_only=True, required=False, source="family_member.family"
    )
    registration_finished = s.SerializerMethodField(read_only=True)
    permission_level = s.SerializerMethodField(read_only=True)

    @swagger_serializer_method(serializer_or_field=s.BooleanField(read_only=True))
    def get_registration_finished(self, obj):
        if not "module" in self.context:
            return False
        return obj.registration_finished(module=self.context["module"])

    @swagger_serializer_method(
        serializer_or_field=EnumField(PermissionLevel, read_only=True)
    )
    def get_permission_level(self, obj):
        if hasattr(obj, "permission_level"):
            return obj.permission_level
        return PermissionLevel.NONE

    class Meta:
        model = User
        fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "birthday",
            "consent_pictures",
            "preferred_language",
            "can_manage",
            "towers",
            "family",
            "registration_finished",
            "permission_level",
            "created_at",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "birthday",
            "consent_pictures",
            "preferred_language",
            "can_manage",
            "towers",
            "family",
            "registration_finished",
            "permission_level",
            "created_at",
        )


class LoginSerializer(s.Serializer):
    email = s.EmailField(required=True)
    password = s.CharField(required=True, trim_whitespace=False)

    def validate_email(self, value):
        email = BaseUserManager.normalize_email(value)
        return re.sub(r"^([^+]*)(\+.*)?(@.*)$", r"\1\3", email)


class CreateOrganisationSerializer(s.Serializer):
    pass


class CreateTowersSerializer(s.Serializer):
    height_shoulders = s.IntegerField(
        required="height_shoulders" in settings.MODULE_TOWERS_USER_FIELDS,
        min_value=50,
        max_value=250,
    )
    height_arms = s.IntegerField(
        required="height_arms" in settings.MODULE_TOWERS_USER_FIELDS,
        min_value=50,
        max_value=250,
    )


class BaseSerializer(s.Serializer):
    firstname = s.CharField(required=True)
    lastname = s.CharField(required=True)
    phone = PhoneNumberField(required="phone" in settings.MODULE_ALL_USER_FIELDS)
    birthday = s.DateField(required=True)
    consent_pictures = s.BooleanField(required=True)
    preferred_language = s.CharField(required=False)

    organisation = CreateOrganisationSerializer()
    towers = CreateTowersSerializer()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if not settings.MODULE_ORG_ENABLED:
            self.fields.pop("organisation")

        if not settings.MODULE_TOWERS_ENABLED:
            self.fields.pop("towers")

    def validate_birthday(self, value: datetime.date):
        if not is_over_minimum_age(date=value):
            raise ValidationError(
                _("The minimum age to join is %s.")
                % settings.MODULE_ALL_USER_MINIMUM_AGE
            )

        return value

    def validate_preferred_language(self, value: str):
        if value not in [code for code, __ in settings.LANGUAGES]:
            raise ValidationError(
                _("Only the following languages are allowed: %s.")
                % ", ".join([f"{name} ({code})" for code, name in settings.LANGUAGES])
            )

        return value

    def validate(self, data):
        if not data["consent_pictures"] and is_over_minimum_age(date=data["birthday"]):
            raise ValidationError(
                {
                    "consent_pictures": _(
                        "Members over %s must consent in order to become members."
                    )
                    % settings.MODULE_ALL_USER_MINIMUM_AGE
                }
            )
        return data


class CreateSerializer(BaseSerializer):
    email = s.EmailField(required=True)
    password = s.CharField(required=True, min_length=8, trim_whitespace=False)
    password2 = s.CharField(required=True, min_length=8, trim_whitespace=False)

    def validate_email(self, value: str):
        email = BaseUserManager.normalize_email(value)
        return re.sub(r"^([^+]*)(\+.*)?(@.*)$", r"\1\3", email)

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise ValidationError({"password2": _("The passwords do not match.")})
        return data


class UpdateSerializer(BaseSerializer):
    pass


class UpdateFamilyMemberSerializer(s.Serializer):
    firstname = s.CharField(required=True)
    lastname = s.CharField(required=True)
    birthday = s.DateField(required=True)
    consent_pictures = s.BooleanField(required=True)

    organisation = CreateOrganisationSerializer()
    towers = CreateTowersSerializer()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if not settings.MODULE_ORG_ENABLED:
            self.fields.pop("organisation")

        if not settings.MODULE_TOWERS_ENABLED:
            self.fields.pop("towers")

    def validate_birthday(self, value: datetime.date):
        if is_over_minimum_age(date=value):
            raise ValidationError(
                _("The family member must be below %s to update.")
                % settings.MODULE_ALL_USER_MINIMUM_AGE
            )

        return value

    def validate(self, data):
        if not data["consent_pictures"] and is_over_minimum_age(date=data["birthday"]):
            raise ValidationError(
                {
                    "consent_pictures": _(
                        "Members over %s must consent in order to become members."
                    )
                    % settings.MODULE_ALL_USER_MINIMUM_AGE
                }
            )
        return data


class CreateFamilyMemberSerializer(s.Serializer):
    firstname = s.CharField(required=True)
    lastname = s.CharField(required=True)
    birthday = s.DateField(required=True)
    consent_pictures = s.BooleanField(required=True)

    organisation = CreateOrganisationSerializer()
    towers = CreateTowersSerializer()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if not settings.MODULE_ORG_ENABLED:
            self.fields.pop("organisation")

        if not settings.MODULE_TOWERS_ENABLED:
            self.fields.pop("towers")

    def validate_birthday(self, value: datetime.date):
        if is_over_minimum_age(date=value):
            raise ValidationError(
                _("The family member must be below %s to create.")
                % settings.MODULE_ALL_USER_MINIMUM_AGE
            )

        return value

    def validate(self, data):
        if not data["consent_pictures"] and is_over_minimum_age(date=data["birthday"]):
            raise ValidationError(
                {
                    "consent_pictures": _(
                        "Members over %s must consent in order to become members."
                    )
                    % settings.MODULE_ALL_USER_MINIMUM_AGE
                }
            )
        return data


class UserChangeUpdateSerializer(s.Serializer):
    email = s.EmailField(required=True)

    def validate_email(self, value: str):
        email = BaseUserManager.normalize_email(value)
        return re.sub(r"^([^+]*)(\+.*)?(@.*)$", r"\1\3", email)


class UserChangeApplySerializer(s.Serializer):
    token = s.CharField(required=True)


class UserPasswordChangeApplySerializer(s.Serializer):
    token = s.CharField(required=True)
    password = s.CharField(required=True, min_length=8, trim_whitespace=False)
    password2 = s.CharField(required=True, min_length=8, trim_whitespace=False)

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise ValidationError({"password2": _("The passwords do not match.")})
        return data


class FamilyMemberRequestExtraSlimSerializer(s.ModelSerializer):
    user_sender = UserExtraSlimSerializer(read_only=True)
    family = FamilySerializer(read_only=True)

    class Meta:
        model = FamilyMemberRequest
        fields = ("id", "user_sender", "family", "status", "created_at")
        read_only_fields = ("id", "user_sender", "family", "status", "created_at")


class FamilyMemberRequestSlimSerializer(FamilyMemberRequestExtraSlimSerializer):
    email_receiver = s.EmailField(read_only=True)

    class Meta:
        model = FamilyMemberRequest
        fields = (
            "id",
            "user_sender",
            "email_receiver",
            "family",
            "status",
            "created_at",
        )
        read_only_fields = (
            "id",
            "user_sender",
            "email_receiver",
            "family",
            "status",
            "created_at",
        )


class CreateFamilyMemberRequestSerializer(s.Serializer):
    email = s.EmailField(required=True)

    def validate_email(self, value: str):
        # raise ValidationError(_("TEST."))
        email = BaseUserManager.normalize_email(value)
        return re.sub(r"^([^+]*)(\+.*)?(@.*)$", r"\1\3", email)
