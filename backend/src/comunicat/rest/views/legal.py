from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination

from comunicat.rest.serializers.legal import TeamSerializer, BylawsSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import legal.api.team
import legal.api.bylaws


class TeamResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class TeamAPI(
    ComuniCatViewSet,
):
    serializer_class = TeamSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = TeamResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: TeamSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        team_objs = legal.api.team.get_list(
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(team_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class BylawsResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class BylawsAPI(
    ComuniCatViewSet,
):
    serializer_class = BylawsSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = BylawsResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: BylawsSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        bylaws_objs = legal.api.bylaws.get_list(
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(bylaws_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
