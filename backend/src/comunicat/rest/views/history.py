from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination

from comunicat.rest.serializers.history import HistoryEventSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import history.api.history_event


class HistoryEventResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class HistoryEventAPI(
    ComuniCatViewSet,
):
    serializer_class = HistoryEventSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = HistoryEventResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: HistoryEventSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        history_event_objs = history.api.history_event.get_list(
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(history_event_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
