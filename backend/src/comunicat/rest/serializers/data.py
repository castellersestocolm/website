from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from data.models import Country, Zone


class RegionSerializer(s.ModelSerializer):
    code = s.CharField(read_only=True)
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Country
        fields = (
            "id",
            "code",
            "name",
        )
        read_only_fields = (
            "id",
            "code",
            "name",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        if hasattr(obj, "name_locale"):
            return obj.name_locale
        return obj.name.get(translation.get_language())


class CountrySerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Country
        fields = (
            "id",
            "code",
            "name",
            "is_starred",
        )
        read_only_fields = (
            "id",
            "code",
            "name",
            "is_starred",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        if hasattr(obj, "name_locale"):
            return obj.name_locale
        return obj.name.get(translation.get_language())


class ZoneSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Zone
        fields = (
            "id",
            "code",
            "name",
        )
        read_only_fields = (
            "id",
            "code",
            "name",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        if hasattr(obj, "name_locale"):
            return obj.name_locale
        return obj.name.get(translation.get_language())


class CountryWithRegionsAndZoneSerializer(CountrySerializer):
    zone = ZoneSerializer(read_only=True)
    regions = RegionSerializer(many=True, read_only=True)

    class Meta:
        model = Country
        fields = (
            "id",
            "code",
            "name",
            "is_starred",
            "zone",
            "regions",
        )
        read_only_fields = (
            "id",
            "code",
            "name",
            "is_starred",
            "zone",
            "regions",
        )
