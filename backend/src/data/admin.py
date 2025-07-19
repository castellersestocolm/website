from django.contrib import admin
from django.db.models import JSONField
from django.utils import translation
from jsoneditor.forms import JSONEditor

from data.models import Country, Region

from django.utils.translation import gettext_lazy as _


class RegionInline(admin.TabularInline):
    model = Region
    ordering = ("code",)
    extra = 0

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    list_display = ("name_locale",)
    list_filter = ("created_at",)
    ordering = (
        "code",
        "-created_at",
    )
    inlines = (RegionInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    name_locale.short_description = _("name")


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    list_display = (
        "name_locale",
        "country",
    )
    list_filter = ("created_at",)
    ordering = (
        "country__code",
        "code",
        "-created_at",
    )

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    name_locale.short_description = _("name")
