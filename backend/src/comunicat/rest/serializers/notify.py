from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.rest.serializers.payment import (
    CreateEntitySerializer,
)
from comunicat.rest.utils.fields import IntEnumField
from notify.enums import ContactMessageStatus, ContactMessageType
from notify.models import ContactMessage, Newsletter


class ContactMessageSerializer(s.ModelSerializer):
    type = IntEnumField(ContactMessageType, read_only=True)
    status = IntEnumField(ContactMessageStatus, read_only=True)

    class Meta:
        model = ContactMessage
        fields = (
            "id",
            "type",
            "status",
            "message",
            "context",
            "created_at",
        )
        read_only_fields = (
            "id",
            "type",
            "status",
            "message",
            "context",
            "created_at",
        )


class CreateContactMessageSerializer(s.Serializer):
    entity = CreateEntitySerializer()
    type = IntEnumField(ContactMessageType)
    message = s.CharField(max_length=1000)
    context = s.DictField(required=False)


class NewsletterSlimSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Newsletter
        fields = (
            "id",
            "name",
        )
        read_only_fields = (
            "id",
            "name",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        if hasattr(obj, "name_locale"):
            return obj.name_locale
        return obj.name.get(translation.get_language())
