import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

import order.api

from comunicat.rest.serializers.order import OrderSerializer, CreateOrderSerializer

from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class OrderResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class OrderAPI(ComuniCatViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = OrderResultsSetPagination
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"order.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateOrderSerializer,
        responses={
            201: OrderSerializer,
            400: Serializer(),
        },
    )
    def create(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            order_obj = order.api.create(
                sizes=validated_data["sizes"],
                user_id=request.user.id,
                module=self.module,
            )
        except Exception as e:
            _log.exception(e)
            return Response(status=400)

        if not order_obj:
            return Response(status=400)

        serializer = self.serializer_class(order_obj, context={"module": self.module})
        return Response(serializer.data, status=201)

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
