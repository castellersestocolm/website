from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s
from versatileimagefield.serializers import VersatileImageFieldSerializer

from comunicat.rest.utils.fields import IntEnumField
from document.enums import DocumentType
from document.models import Document


class ListDocumentSerializer(s.Serializer):
    filter_types = s.ListSerializer(child=IntEnumField(DocumentType), required=False)

    def to_internal_value(self, data):
        data["filter_types"] = (
            data["filter_types"][0].split(",") if data["filter_types"] else []
        )
        data = super().to_internal_value(data)
        return data


class DocumentSerializer(s.ModelSerializer):
    file = s.SerializerMethodField(read_only=True)
    preview = VersatileImageFieldSerializer(
        allow_null=True,
        sizes=[
            ("large", "url"),
            # TODO: Fix this
            ("medium", "url"),
            ("small", "url"),
            # ("medium", "thumbnail__500x500"),
            # ("small", "thumbnail__100x100")
        ],
        read_only=True,
    )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_file(self, obj):
        if obj.file:
            return obj.file.url
        return obj.file_public.url

    class Meta:
        model = Document
        fields = (
            "id",
            "name",
            "code",
            "language",
            "version",
            "type",
            "order",
            "file",
            "preview",
        )
        read_only_fields = (
            "id",
            "name",
            "code",
            "language",
            "version",
            "type",
            "order",
            "file",
            "preview",
        )
