from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from product.models import Product, ProductSize


class ProductSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "type",
        )
        read_only_fields = (
            "id",
            "name",
            "type",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())


class ProductSizeSerializer(s.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ProductSize
        fields = (
            "id",
            "product",
            "category",
            "size",
        )
        read_only_fields = (
            "id",
            "product",
            "category",
            "size",
        )
