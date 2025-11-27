from rest_framework import serializers as s

from comunicat.rest.serializers.payment import (
    CreateEntitySerializer,
)
from comunicat.rest.utils.fields import IntEnumField
from notify.enums import ContactMessageStatus, ContactMessageType
from notify.models import ContactMessage


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
