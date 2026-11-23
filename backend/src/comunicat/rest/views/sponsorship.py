from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import sponsorship.api
from comunicat.rest.serializers.sponsorship import (
    SponsorshipPageSerializer,
    SponsorshipSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet


class SponsorshipResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class SponsorshipAPI(ComuniCatViewSet):
    serializer_class = SponsorshipSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: SponsorshipSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    # @method_decorator(cache_control(private=True))
    def list(self, request):
        sponsorship_objs = sponsorship.api.get_list(
            module=self.module,
        )

        serializer = self.serializer_class(
            sponsorship_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        query_serializer=SponsorshipPageSerializer(),
        responses={200: SponsorshipSerializer(), 404: Serializer()},
    )
    @action(methods=["get"], detail=False, url_path="page", url_name="page")
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def page(self, request):
        serializer = SponsorshipPageSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        sponsorship_obj = sponsorship.api.get(
            code=serializer.validated_data.get("code"),
            event_id=serializer.validated_data.get("event_id"),
            module=self.module,
        )

        if not sponsorship_obj:
            return Response(status=404)

        serializer = self.serializer_class(
            sponsorship_obj, context={"module": self.module}
        )
        return Response(serializer.data)
