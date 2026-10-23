from django import forms
from django.contrib import admin

from theme.models import Colour, Icon, Theme


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


@admin.register(Colour)
class ColourAdmin(admin.ModelAdmin):
    search_fields = ("code",)
    list_display = (
        "module",
        "type",
        "code",
    )
    list_filter = ("module", "type", "created_at")
    ordering = (
        "module",
        "type",
        "code",
        "-created_at",
    )


class ThemeForm(forms.ModelForm):
    class Meta:
        model = Theme
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        colour_qs = Colour.objects.filter(module=self.instance.module).order_by(
            "module", "type", "code", "-created_at"
        )

        self.fields["colour_primary"].queryset = colour_qs
        self.fields["colour_secondary"].queryset = colour_qs
        self.fields["colour_icon"].queryset = colour_qs


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    list_display = (
        "name",
        "icon",
        "colour_primary",
        "colour_secondary",
        "colour_icon",
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
