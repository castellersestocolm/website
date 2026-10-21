from django.contrib import admin

from theme.models import Icon, Theme


@admin.register(Icon)
class IconAdmin(admin.ModelAdmin):
    search_fields = ("code",)
    list_display = (
        "code",
        "type",
    )
    list_filter = ("type", "created_at")
    ordering = (
        "type",
        "code",
        "-created_at",
    )


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    list_display = (
        "name",
        "icon",
        "colour_primary",
        "colour_secondary",
        "module",
    )
    list_filter = (
        "module",
        "created_at",
    )
    ordering = (
        "module",
        "name",
        "-created_at",
    )
