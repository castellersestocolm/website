import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page, cache_control
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

import order.api
import order.api.delivery_provider
import order.api.delivery_price

from comunicat.rest.serializers.order import (
    OrderSerializer,
    CreateOrderSerializer,
    DeliveryProviderSerializer,
    DeliveryPriceSerializer,
)

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
            412: Serializer(),
        },
    )
    def create(self, request):
        serializer = CreateOrderSerializer(
            data=request.data,
            user=request.user if request.user.is_authenticated else None,
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            order_obj = order.api.create(
                sizes=validated_data["cart"]["sizes"],
                delivery=validated_data["delivery"],
                user=validated_data.get("user"),
                pickup=validated_data.get("pickup"),
                user_id=request.user.id if request.user.is_authenticated else None,
                module=self.module,
            )
        except Exception as e:
            _log.exception(e)
            return Response(status=412)

        if not order_obj:
            return Response(status=400)

        serializer = self.serializer_class(order_obj, context={"module": self.module})
        return Response(serializer.data, status=201)

    @swagger_auto_schema(
        responses={200: OrderSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
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


class DeliveryProviderAPI(ComuniCatViewSet):
    serializer_class = DeliveryProviderSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: DeliveryProviderSerializer(many=True), 400: Serializer()},
    )
    # @method_decorator(cache_page(60))
    def list(self, request):
        delivery_provider_objs = order.api.delivery_provider.get_list(
            module=self.module
        )

        serializer = self.serializer_class(
            delivery_provider_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)


class DeliveryPriceAPI(ComuniCatViewSet):
    serializer_class = DeliveryPriceSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: DeliveryPriceSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        delivery_price_objs = order.api.delivery_price.get_list(module=self.module)

        serializer = self.serializer_class(
            delivery_price_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)
