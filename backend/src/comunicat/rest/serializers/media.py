from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from media.models import Release, ReleaseImage


class ReleaseImageSerializer(s.ModelSerializer):
    class Meta:
        model = ReleaseImage
        fields = (
            "id",
            "picture",
            "footnote",
        )
        read_only_fields = (
            "id",
            "picture",
            "footnote",
        )


class ReleaseSerializer(s.ModelSerializer):
    title = s.SerializerMethodField(read_only=True)
    subtitle = s.SerializerMethodField(read_only=True)
    content = s.SerializerMethodField(read_only=True)
    images = ReleaseImageSerializer(many=True, read_only=True)

    class Meta:
        model = Release
        fields = (
            "id",
            "title",
            "subtitle",
            "slug",
            "date",
            "content",
            "images",
        )
        read_only_fields = (
            "id",
            "title",
            "subtitle",
            "slug",
            "date",
            "content",
            "images",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_title(self, obj):
        return (
            obj.title.get(translation.get_language())
            or ([title for title in obj.title.values() if title] + [""])[0]
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_subtitle(self, obj):
        return (
            obj.subtitle.get(translation.get_language())
            or ([subtitle for subtitle in obj.subtitle.values() if subtitle] + [""])[0]
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_content(self, obj):
        return (
            obj.content.get(translation.get_language())
            or ([content for content in obj.content.values() if content] + [""])[0]
        )
