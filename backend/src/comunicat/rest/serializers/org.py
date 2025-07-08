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


class MemberAdultSerializer(s.Serializer):
    firstname = s.CharField(required=True)
    lastname = s.CharField(required=True)
    email = s.EmailField(required=True)
    phone = PhoneNumberField(required="phone" in settings.MODULE_ALL_USER_FIELDS)

    def validate_email(self, value: str):
        email = BaseUserManager.normalize_email(value)
        return re.sub(r"^([^+]*)(\+.*)?(@.*)$", r"\1\3", email)


class MemberChildSerializer(s.Serializer):
    firstname = s.CharField(required=True)
    lastname = s.CharField(required=True)
    birthday = s.DateField(required=True)


class OrgCreateSerializer(s.Serializer):
    adults = s.ListSerializer(
        child=MemberAdultSerializer(), min_length=1, max_length=2, required=True
    )
    children = s.ListSerializer(
        child=MemberChildSerializer(), min_length=0, max_length=10, required=True
    )
