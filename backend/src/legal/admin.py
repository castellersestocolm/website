from django.contrib import admin
from django.db.models import JSONField
from django.utils import translation
from jsoneditor.forms import JSONEditor

from legal.models import Team, Member, Role, Bylaws

from django.utils.translation import gettext_lazy as _


class MemberInline(admin.TabularInline):
    model = Member
    raw_id_fields = ("user",)
    extra = 0


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name_locale",
        "module",
        "date_from",
        "date_to",
        "created_at",
    )
    list_filter = ("module", "date_from", "date_to", "created_at")
    ordering = ("-date_from", "module")
    inlines = (MemberInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    name_locale.short_description = _("name")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name_locale",
        "order",
        "created_at",
    )
    list_filter = ("created_at",)
    ordering = ("order", "name")

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def name_locale(self, obj):
        return obj.name.get(translation.get_language()) or list(obj.name.values())[0]

    name_locale.short_description = _("name")


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    search_fields = (
        "id",
        "user__id",
        "user__email",
        "user__firstname",
        "user__lastname",
        "user__phone",
    )
    list_display = (
        "user",
        "team",
        "role",
        "created_at",
    )
    list_filter = ("team", "role", "created_at")
    ordering = ("-created_at",)


@admin.register(Bylaws)
class BylawsAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "module",
        "date",
        "created_at",
    )
    list_filter = ("module", "date", "created_at")
    ordering = ("-date",)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }
