from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination

import pinyator.api
from comunicat.rest.serializers.towers import CastleSerializer, ListCastleSerializer

from comunicat.rest.viewsets import ComuniCatViewSet


class TowersResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class TowersCastleAPI(
    ComuniCatViewSet,
):
    serializer_class = CastleSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = TowersResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=ListCastleSerializer,
        responses={200: CastleSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        serializer = ListCastleSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        castles = pinyator.api.get_castles_for_event(
            event_id=serializer.validated_data["event_id"]
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(castles, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
