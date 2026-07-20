from django.utils.translation import gettext_lazy as _
from rest_framework import serializers as s
from rest_framework.exceptions import ValidationError

from comunicat.rest.serializers.notify import NewsletterSlimSerializer
from comunicat.rest.serializers.payment import CreateEntitySerializer
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


class CreateEntityConsentSerializer(s.Serializer):
    type = IntEnumField(ConsentType)
    newsletter_id = s.UUIDField(required=False)


class CreateEntityConsentsSerializer(s.Serializer):
    entity = CreateEntitySerializer(required=False)
    consents = CreateEntityConsentSerializer(many=True)

    def validate_entity(self, value: str | None):
        user_obj = self.context.get("user")

        if not user_obj and not value:
            raise ValidationError(
                {"entity": _("The entity is required for non-logged in users.")}
            )

        return value
