from rest_framework import serializers as s

from theme.models import Icon, Theme


class IconSerializer(s.ModelSerializer):
    class Meta:
        model = Icon
        fields = ("id", "code", "type", "created_at")
        read_only_fields = ("id", "code", "type", "created_at")


class ThemeSerializer(s.ModelSerializer):
    icon = IconSerializer()

    class Meta:
        model = Theme
        fields = (
            "id",
            "name",
            "icon",
            "colour_primary",
            "colour_secondary",
            "colour_icon",
        )
        read_only_fields = (
            "id",
            "name",
            "icon",
            "colour_primary",
            "colour_secondary",
            "colour_icon",
        )
