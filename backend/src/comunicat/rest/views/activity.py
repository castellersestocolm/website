import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination

import activity.api.program

from comunicat.rest.serializers.activity import ProgramSerializer

from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class ProgramResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProgramAPI(ComuniCatViewSet):
    serializer_class = ProgramSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ProgramResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: ProgramSerializer(many=True)},
    )
    # @method_decorator(cache_page(60))
    def list(self, request):
        program_objs = activity.api.program.get_list(
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(program_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
