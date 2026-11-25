from django.utils import translation
from django.utils.translation import gettext_lazy as _
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s
from rest_framework.exceptions import ValidationError

from comunicat.enums import Module
from comunicat.rest.serializers.event import EventSlimSerializer
from comunicat.rest.serializers.notify import NewsletterSlimSerializer
from comunicat.rest.serializers.payment import (
    CreateEntitySerializer,
    EntitySlimSerializer,
)
from comunicat.rest.serializers.product import ProductSlimSerializer
from comunicat.rest.serializers.theme import IconSerializer
from comunicat.rest.utils.fields import IntEnumField, MoneyField
from sponsorship.enums import RewardType, SponsorshipStatus, SponsorshipType
from sponsorship.models import (
    EntityTier,
    Reward,
    RewardGroup,
    Sponsorship,
    Tier,
    TierPrice,
)


class RewardSerializer(s.ModelSerializer):
    type = IntEnumField(RewardType, read_only=True)
    name = s.SerializerMethodField(read_only=True)
    description = s.SerializerMethodField(read_only=True)
    icon = IconSerializer(read_only=True)
    product = ProductSlimSerializer(read_only=True)
    newsletter = NewsletterSlimSerializer(read_only=True)

    class Meta:
        model = Reward
        fields = (
            "id",
            "type",
            "name",
            "description",
            "icon",
            "product",
            "newsletter",
        )
        read_only_fields = (
            "id",
            "type",
            "name",
            "description",
            "icon",
            "product",
            "newsletter",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())


class RewardGroupSerializer(s.ModelSerializer):
    rewards = RewardSerializer(many=True, read_only=True)

    class Meta:
        model = RewardGroup
        fields = (
            "id",
            "min_rewards",
            "max_rewards",
            "order",
            "rewards",
        )
        read_only_fields = (
            "id",
            "min_rewards",
            "max_rewards",
            "order",
            "rewards",
        )


class TierPriceSerializer(s.ModelSerializer):
    amount = MoneyField(with_exchange=True, read_only=True)

    class Meta:
        model = TierPrice
        fields = (
            "id",
            "module",
            "amount",
        )
        read_only_fields = (
            "id",
            "module",
            "amount",
        )


class TierSlimSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    description = s.SerializerMethodField(read_only=True)
    prices = TierPriceSerializer(read_only=True, many=True)
    reward_groups = RewardGroupSerializer(read_only=True, many=True)

    class Meta:
        model = Tier
        fields = (
            "id",
            "name",
            "description",
            "length_days",
            "length_months",
            "length_years",
            "order",
            "prices",
            "reward_groups",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "length_days",
            "length_months",
            "length_years",
            "order",
            "prices",
            "reward_groups",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())


class SponsorshipSlimSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    description = s.SerializerMethodField(read_only=True)
    type = IntEnumField(SponsorshipType, read_only=True)
    status = IntEnumField(SponsorshipStatus, read_only=True)
    module = IntEnumField(Module, read_only=True)
    event = EventSlimSerializer(required=False, read_only=True)

    class Meta:
        model = Sponsorship
        fields = (
            "id",
            "name",
            "description",
            "code",
            "type",
            "status",
            "module",
            "date_from",
            "date_to",
            "event",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "code",
            "type",
            "status",
            "module",
            "date_from",
            "date_to",
            "event",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())


class SponsorshipSerializer(SponsorshipSlimSerializer):
    tiers = TierSlimSerializer(many=True, read_only=True)

    class Meta:
        model = Sponsorship
        fields = (
            "id",
            "name",
            "description",
            "code",
            "type",
            "status",
            "module",
            "date_from",
            "date_to",
            "event",
            "tiers",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "code",
            "type",
            "status",
            "module",
            "date_from",
            "date_to",
            "event",
            "tiers",
            "created_at",
        )


class TierSerializer(TierSlimSerializer):
    sponsorship = SponsorshipSlimSerializer(read_only=True)

    class Meta:
        model = Tier
        fields = (
            "id",
            "name",
            "description",
            "sponsorship",
            "length_days",
            "length_months",
            "length_years",
            "order",
            "prices",
            "reward_groups",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "sponsorship",
            "length_days",
            "length_months",
            "length_years",
            "order",
            "prices",
            "reward_groups",
            "created_at",
        )


class EntityTierSerializer(s.ModelSerializer):
    entity = EntitySlimSerializer(read_only=True)
    amount = MoneyField(read_only=True)

    class Meta:
        model = EntityTier
        fields = (
            "id",
            "entity",
            "date_from",
            "date_to",
            "amount",
            "created_at",
        )
        read_only_fields = (
            "id",
            "entity",
            "date_from",
            "date_to",
            "amount",
            "created_at",
        )


class SponsorshipPageSerializer(s.Serializer):
    code = s.CharField(required=False)
    event_id = s.UUIDField(required=False)

    def validate(self, data):
        if "code" not in data and "event_id" not in data:
            raise ValidationError(
                {
                    "code": _("The code must be provided if no event_id is given."),
                }
            )

        return data


class CreateEntityRewardSerializer(s.Serializer):
    id = s.UUIDField()


class CreateEntityTierSerializer(s.Serializer):
    entity = CreateEntitySerializer(required=False)
    tier_id = s.UUIDField()
    rewards = CreateEntityRewardSerializer(many=True, required=False)
    is_public = s.BooleanField(required=False)

    def validate_entity(self, value: str | None):
        user_obj = self.context.get("user")

        if not user_obj and not value:
            raise ValidationError(
                {"entity": _("The entity is required for non-logged in users.")}
            )

        return value
