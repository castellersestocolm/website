from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page, cache_control
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination

import towers.api
from comunicat.rest.serializers.towers import (
    ListTowerSerializer,
    TowerWithPlacesAliasSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet


class TowersResultsSetPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


class TowersCastleAPI(
    ComuniCatViewSet,
):
    serializer_class = TowerWithPlacesAliasSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = TowersResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=ListTowerSerializer(),
        responses={200: TowerWithPlacesAliasSerializer(many=True)},
    )
    # @method_decorator(cache_page(60))
    # @method_decorator(cache_control(private=True))
    def list(self, request):
        serializer = ListTowerSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        event_towers = towers.api.get_towers_for_event(
            event_id=serializer.validated_data["event_id"],
            user_id=request.user.is_authenticated and request.user.id,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(event_towers, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
