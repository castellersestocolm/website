from rest_framework import serializers as s

from user.models import User


PASSWORD_REQUIREMENTS = {"min_length": 8, "max_length": 128, "trim_whitespace": False}


class UserSerializer(s.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "is_staff",
            "is_active",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "phone",
            "is_staff",
            "is_active",
        )
