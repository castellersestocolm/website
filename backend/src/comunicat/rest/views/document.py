import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page, cache_control
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from sentry_sdk.integrations.django import is_authenticated

import document.api

from comunicat.rest.serializers.document import (
    DocumentSerializer,
    ListDocumentSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class DocumentResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DocumentAPI(ComuniCatViewSet):
    serializer_class = DocumentSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = DocumentResultsSetPagination

    @swagger_auto_schema(
        query_serializer=ListDocumentSerializer,
        responses={200: DocumentSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        serializer = ListDocumentSerializer(data=dict(request.query_params))
        serializer.is_valid(raise_exception=True)

        document_objs = document.api.get_list(
            module=self.module,
            is_authenticated=request.user.is_authenticated,
            **serializer.validated_data
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(document_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
