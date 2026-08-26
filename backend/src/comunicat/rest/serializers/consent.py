from django.utils.translation import gettext_lazy as _
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s
from rest_framework.exceptions import ValidationError

from comunicat.enums import Module
from comunicat.rest.serializers.notify import NewsletterSlimSerializer
from comunicat.rest.serializers.payment import CreateEntitySerializer
from comunicat.rest.utils.fields import IntEnumField
from consent.consts import REQUIRED_CONSENT_TYPE_BY_MODULE
from consent.enums import ConsentType
from consent.models import EntityConsent


class EntityConsentSerializer(s.ModelSerializer):
    type = IntEnumField(ConsentType, read_only=True)
    module = IntEnumField(Module, read_only=True)
    is_required = s.SerializerMethodField(read_only=True)
    newsletter = NewsletterSlimSerializer(required=False, read_only=True)

    class Meta:
        model = EntityConsent
        fields = (
            "id",
            "type",
            "module",
            "is_required",
            "newsletter",
            "created_at",
            "deleted_at",
        )
        read_only_fields = (
            "id",
            "type",
            "module",
            "is_required",
            "newsletter",
            "created_at",
            "deleted_at",
        )

    @swagger_serializer_method(serializer_or_field=s.BooleanField(read_only=True))
    def get_is_required(self, obj):
        if hasattr(obj, "is_required"):
            return obj.is_required

        return obj.type in REQUIRED_CONSENT_TYPE_BY_MODULE[obj.module]


class CreateEntityConsentSerializer(s.Serializer):
    type = IntEnumField(ConsentType)
    newsletter_id = s.UUIDField(required=False)
    is_active = s.BooleanField()


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
