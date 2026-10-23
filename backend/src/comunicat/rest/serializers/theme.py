from rest_framework import serializers as s

from theme.models import Colour, Icon, Theme


class IconSerializer(s.ModelSerializer):
    class Meta:
        model = Icon
        fields = ("id", "code", "type", "created_at")
        read_only_fields = ("id", "code", "type", "created_at")


class ColourSerializer(s.ModelSerializer):
    class Meta:
        model = Colour
        fields = ("id", "type", "code", "created_at")
        read_only_fields = ("id", "type", "code", "created_at")


class ThemeSerializer(s.ModelSerializer):
    icon = IconSerializer()
    colour_primary = ColourSerializer(required=False)
    colour_secondary = ColourSerializer(required=False)
    colour_icon = ColourSerializer(required=False)

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
