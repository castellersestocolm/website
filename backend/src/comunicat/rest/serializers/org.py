import re

from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers as s


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
    activities = s.ListSerializer(required=True, child=s.UUIDField())


class OrgCreateSerializer(s.Serializer):
    adults = s.ListSerializer(
        child=MemberAdultSerializer(), min_length=1, max_length=2, required=True
    )
    children = s.ListSerializer(
        child=MemberChildSerializer(), min_length=0, max_length=10, required=True
    )


class OrgCheckSerializer(s.Serializer):
    email = s.EmailField(required=True)
