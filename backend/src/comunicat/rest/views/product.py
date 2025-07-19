from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page, cache_control
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer

import product.api

from comunicat.rest.serializers.product import (
    ProductWithStockSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet


class ProductResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductAPI(ComuniCatViewSet):
    serializer_class = ProductWithStockSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ProductResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: ProductWithStockSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        product_objs = product.api.get_list(
            user_id=request.user.id if request.user.is_authenticated else None,
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(product_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
