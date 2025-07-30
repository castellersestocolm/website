from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.rest.utils.fields import MoneyField
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
    stock_out_pending = s.IntegerField(read_only=True)
    price = MoneyField(required=False, read_only=True)
    price_vat = MoneyField(required=False, read_only=True)

    class Meta:
        model = ProductSize
        fields = (
            "id",
            "category",
            "size",
            "stock",
            "stock_out_pending",
            "price",
            "price_vat",
        )
        read_only_fields = (
            "id",
            "category",
            "size",
            "stock",
            "stock_out_pending",
            "price",
            "price_vat",
        )


class ProductPriceSerializer(s.Serializer):
    min = MoneyField(required=False, read_only=True)
    max = MoneyField(required=False, read_only=True)


class ProductSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    description = s.SerializerMethodField(read_only=True)
    sizes = ProductSizeWithStockSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    price = s.SerializerMethodField(required=False, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "type",
            "weight_grams",
            "sizes",
            "images",
            "price",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "type",
            "weight_grams",
            "sizes",
            "images",
            "price",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())

    @swagger_serializer_method(
        serializer_or_field=ProductPriceSerializer(required=False, read_only=True)
    )
    def get_price(self, obj):
        if (
            not hasattr(obj, "price_min")
            or obj.price_min is None
            or not hasattr(obj, "price_max")
            or obj.price_max is None
        ):
            return None
        return {
            "min": {
                "amount": obj.price_min.amount,
                "currency": obj.price_min.currency.code,
            },
            "max": {
                "amount": obj.price_max.amount,
                "currency": obj.price_max.currency.code,
            },
        }


class ProductWithStockSerializer(ProductSerializer):
    stock = s.IntegerField(read_only=True)
    stock_out_pending = s.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "type",
            "weight_grams",
            "ignore_stock",
            "stock",
            "stock_out_pending",
            "price",
            "sizes",
            "images",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "type",
            "weight_grams",
            "ignore_stock",
            "stock",
            "stock_out_pending",
            "price",
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
