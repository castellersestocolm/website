from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

import order.api

from comunicat.rest.serializers.order import OrderSerializer

from comunicat.rest.viewsets import ComuniCatViewSet


class OrderResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class OrderAPI(ComuniCatViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = OrderResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: OrderSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        order_objs = order.api.get_list(user_id=request.user.id, module=self.module)

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(order_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
