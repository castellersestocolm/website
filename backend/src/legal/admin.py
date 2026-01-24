from django.contrib import admin
from django.db.models import JSONField
from jsoneditor.forms import JSONEditor

from legal.models import Team, Member, Role, Bylaws, Group

from django.utils.translation import gettext_lazy as _


class TeamInline(admin.TabularInline):
    model = Team
    fields = ("name_locale", "type")
    readonly_fields = ("name_locale", "type")
    extra = 0

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

    name_locale.short_description = _("name")


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    search_fields = ("id",)
    list_display = (
        "module",
        "date_from",
        "date_to",
        "created_at",
    )
    list_filter = ("module", "date_from", "date_to", "created_at")
    ordering = ("-date_from", "module")
    inlines = (TeamInline,)


class MemberInline(admin.TabularInline):
    model = Member
    raw_id_fields = ("user",)
    extra = 0


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    search_fields = ("id", "name")
    list_display = (
        "name_locale",
        "group",
        "created_at",
    )
    list_filter = ("group", "created_at")
    ordering = ("-group__date_from", "group__module")
    inlines = (MemberInline,)

    formfield_overrides = {
        JSONField: {"widget": JSONEditor},
    }

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

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

    def get_queryset(self, request):
        return super().get_queryset(request).with_name()

    def name_locale(self, obj):
        return obj.name_locale

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
