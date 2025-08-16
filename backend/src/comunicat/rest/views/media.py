from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from comunicat.consts import PERMISSIONS_BY_LEVEL
from comunicat.rest.serializers.media import ReleaseSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import media.api.release


class ReleaseResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ReleaseAPI(
    ComuniCatViewSet,
):
    serializer_class = ReleaseSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ReleaseResultsSetPagination
    lookup_field = "slug"
    lookup_value_regex = ".*"

    @swagger_auto_schema(
        responses={200: ReleaseSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        release_objs = media.api.release.get_list(
            module=self.module,
            only_published=not request.user.is_authenticated
            or request.user.permission_level
            < PERMISSIONS_BY_LEVEL["media"]["release"]["list"],
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(release_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        responses={200: ReleaseSerializer(), 404: Serializer()},
    )
    @method_decorator(cache_page(60))
    def retrieve(self, request, slug):
        release_obj = media.api.release.get(
            slug=slug,
            module=self.module,
            only_published=not request.user.is_authenticated
            or request.user.permission_level
            < PERMISSIONS_BY_LEVEL["media"]["release"]["retrieve"],
        )

        if not release_obj:
            return Response(status=404)

        serializer = self.serializer_class(release_obj, context={"module": self.module})
        return Response(serializer.data)
