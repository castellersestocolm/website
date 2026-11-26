import tempfile
from uuid import UUID

from django.contrib import admin
from django.db.models import JSONField
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.urls import path
from django.utils.translation import gettext_lazy as _
from jsoneditor.forms import JSONEditor
from weasyprint import HTML

from comunicat.consts import TEMPLATE_PDF_BY_MODULE
from comunicat.enums import PDFType
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
    ordering = ("sponsorship__name", "order", "name")
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
    ordering = ("tier__order", "order")


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

    def get_urls(self):
        urls = super().get_urls()

        return [
            path(
                "<path:object_id>/diploma/",
                self.diploma,
                name="sponsorship_entitytier_diploma",
            )
        ] + urls

    def diploma(self, request, object_id: UUID):
        response = HttpResponse(content_type="aplication/pdf")
        response["Content-Disposition"] = "attachment; filename=Diploma.pdf"
        response["Content-Transfer-Encoding"] = "binary"

        entity_tier_obj = (
            EntityTier.objects.filter(id=object_id)
            .select_related("tier", "tier__sponsorship", "entity", "entity__user")
            .first()
        )

        context = {
            "entity_tier_obj": entity_tier_obj,
        }
        html_string = render_to_string(
            template_name=TEMPLATE_PDF_BY_MODULE[request.module][
                PDFType.SPONSORSHIP_DIPLOMA
            ]["pdf"],
            context=context,
        )
        html = HTML(string=html_string)
        result = html.write_pdf()

        with tempfile.NamedTemporaryFile(delete=True) as output:
            output.write(result)
            output.flush()

            output = open(output.name, "rb")
            response.write(output.read())

        return response
