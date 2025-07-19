from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page, cache_control
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

from comunicat.rest.serializers.payment import PaymentSerializer, ExpenseSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import payment.api
import payment.api.expense


class PaymentResultsSetPagination(PageNumberPagination):
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
