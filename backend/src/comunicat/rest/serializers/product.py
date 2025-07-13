from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from product.models import Product, ProductSize, ProductImage


class ProductImageSerializer(s.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = (
            "id",
            "picture",
        )
        read_only_fields = (
            "id",
            "picture",
        )


class ProductSizeWithStockSerializer(s.ModelSerializer):
    stock = s.IntegerField(read_only=True)

    class Meta:
        model = ProductSize
        fields = (
            "id",
            "category",
            "size",
            "stock",
        )
        read_only_fields = (
            "id",
            "category",
            "size",
            "stock",
        )


class ProductSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    sizes = ProductSizeWithStockSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "type",
            "sizes",
            "images",
        )
        read_only_fields = (
            "id",
            "name",
            "type",
            "sizes",
            "images",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())


class ProductWithStockSerializer(ProductSerializer):
    stock = s.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "type",
            "stock",
            "sizes",
            "images",
        )
        read_only_fields = (
            "id",
            "name",
            "type",
            "stock",
            "sizes",
            "images",
        )


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
