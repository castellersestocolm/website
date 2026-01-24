from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from history.models import HistoryEvent


class HistoryEventSerializer(s.ModelSerializer):
    title = s.SerializerMethodField(read_only=True)
    description = s.SerializerMethodField(read_only=True)

    class Meta:
        model = HistoryEvent
        fields = (
            "id",
            "title",
            "description",
            "module",
            "date",
            "icon",
            "created_at",
        )
        read_only_fields = (
            "id",
            "title",
            "description",
            "module",
            "date",
            "icon",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_title(self, obj):
        return obj.title.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())
