from rest_framework import serializers as s
from versatileimagefield.serializers import VersatileImageFieldSerializer

from document.models import Document


class DocumentSerializer(s.ModelSerializer):
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
