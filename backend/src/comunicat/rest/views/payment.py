from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import payment.api
import payment.api.expense
import payment.api.payment_provider
import payment.api.payment_request
import user.api.event
from comunicat.rest.serializers.payment import (
    EntityListRequestSerializer,
    EntitySerializer,
    ExpenseSerializer,
    PaymentProviderSerializer,
    PaymentRequestSerializer,
    PaymentSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet


class PaymentResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class PaymentRequestResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class EntityResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class PaymentAPI(ComuniCatViewSet):
    serializer_class = PaymentSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = PaymentResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: PaymentSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        payment_objs = payment.api.get_list(user_id=request.user.id, module=self.module)

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(payment_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class ExpenseAPI(ComuniCatViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = PaymentResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: ExpenseSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        expense_objs = payment.api.expense.get_list(
            user_id=request.user.id, module=self.module
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(expense_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class PaymentProviderAPI(ComuniCatViewSet):
    serializer_class = PaymentProviderSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: PaymentProviderSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        payment_provider_objs = payment.api.payment_provider.get_list(
            module=self.module
        )

        serializer = self.serializer_class(
            payment_provider_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)


class PaymentRequestAPI(ComuniCatViewSet):
    serializer_class = PaymentRequestSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = PaymentRequestResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: PaymentRequestSerializer(many=True), 400: Serializer()},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        payment_objs = payment.api.payment_request.get_list(
            user_id=request.user.id, module=self.module
        )

        serializer = self.serializer_class(
            payment_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        responses={200: PaymentRequestSerializer(), 404: Serializer()},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def retrieve(self, request, id):
        payment_obj = payment.api.payment_request.get(
            payment_request_id=id, user_id=request.user.id, module=self.module
        )

        if not payment_obj:
            return Response(status=404)

        serializer = self.serializer_class(payment_obj, context={"module": self.module})
        return Response(serializer.data)


class EntityAPI(ComuniCatViewSet):
    serializer_class = EntitySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = EntityResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=EntityListRequestSerializer(),
        responses={200: EntitySerializer(), 404: Serializer()},
    )
    @action(methods=["get"], detail=False, url_path="me", url_name="me")
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def me(self, request):
        serializer = EntityListRequestSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data.get("token")
        entity_obj = (
            request.user.entity
            if request.user.is_authenticated and hasattr(request.user, "entity")
            else (
                user.api.event.get_entity_by_events_signup_token(token=token)
                if token
                else None
            )
        )

        if not entity_obj:
            return Response(status=401)

        serializer = self.serializer_class(
            entity_obj, context={"module": self.module, "user": request.user}
        )
        return Response(serializer.data)
