from django.contrib import admin
from django.db.models import JSONField
from django.utils.translation import gettext_lazy as _
from jsoneditor.forms import JSONEditor

from sponsorship.models import (
    EntityTier,
    Reward,
    RewardGroup,
    Sponsorship,
    Tier,
    TierPrice,
)


class TierInline(admin.TabularInline):
    model = Tier
    ordering = ("order",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


@admin.register(Sponsorship)
class SponsorshipAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "code")
    list_display = (
        "name_locale",
        "code",
        "type",
        "status",
        "date_from",
        "date_to",
        "module",
    )
    list_filter = ("type", "status", "date_from", "date_to", "module")
    raw_id_fields = ("event",)
    ordering = ("name",)
    inlines = (TierInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

    name_locale.short_description = _("name")


class TierPriceInline(admin.TabularInline):
    model = TierPrice
    ordering = ("module", "amount")
    extra = 0


@admin.register(Tier)
class TierAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "sponsorship__name", "sponsorship__code")
    list_display = (
        "name_locale",
        "sponsorship",
        "length_days",
        "length_months",
        "length_years",
        "order",
    )
    list_filter = ("sponsorship",)
    raw_id_fields = ("sponsorship",)
    ordering = ("sponsorship__name", "name")
    inlines = (TierPriceInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

    name_locale.short_description = _("name")


@admin.register(RewardGroup)
class RewardGroupAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "tier__name",
        "tier__sponsorship__name",
        "tier__sponsorship__code",
    )
    list_display = ("id", "tier", "order", "min_rewards", "max_rewards")
    list_filter = ("tier",)
    raw_id_fields = ("tier",)
    ordering = ("tier", "order")


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    search_fields = ("id", "name", "product__name", "newsletter__name")
    list_display = ("id", "type", "name_locale", "product", "newsletter")
    list_filter = ("type",)
    raw_id_fields = ("product", "newsletter")
    ordering = ("type", "product", "newsletter")

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

    name_locale.short_description = _("name")


@admin.register(EntityTier)
class EntityTierAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "entity__firstname",
        "entity__lastname",
        "entity__email",
        "tier__name",
        "tier__sponsorship__name",
        "tier__sponsorship__code",
    )
    list_display = (
        "entity",
        "tier",
        "date_from",
        "date_to",
        "amount",
        "status",
        "created_at",
    )
    list_filter = ("date_from", "date_to", "tier", "status")
    raw_id_fields = ("entity",)
    ordering = ("-created_at",)
