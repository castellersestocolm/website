import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination

import document.api

from comunicat.rest.permissions import AllowLevelUser
from comunicat.rest.serializers.document import DocumentSerializer

from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class DocumentResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DocumentAPI(ComuniCatViewSet):
    serializer_class = DocumentSerializer
    permission_classes = (AllowLevelUser,)
    pagination_class = DocumentResultsSetPagination

    @swagger_auto_schema(
        responses={200: DocumentSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        document_objs = document.api.get_list(module=self.module)

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(document_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
