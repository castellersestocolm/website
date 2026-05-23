from rest_framework import serializers as s

from comunicat.rest.serializers.notify import NewsletterSlimSerializer
from comunicat.rest.utils.fields import IntEnumField
from consent.enums import ConsentType
from consent.models import EntityConsent


class EntityConsentSerializer(s.ModelSerializer):
    type = IntEnumField(ConsentType, read_only=True)
    newsletter = NewsletterSlimSerializer(required=False, read_only=True)

    class Meta:
        model = EntityConsent
        fields = ("id", "type", "newsletter", "created_at", "deleted_at")
        read_only_fields = ("id", "type", "newsletter", "created_at", "deleted_at")
