import logging

from django.utils import translation
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response

import data.api.country
from comunicat.rest.serializers.data import CountryWithRegionsSerializer

from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class LocationAPI(ComuniCatViewSet):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(
        responses={200: CountryWithRegionsSerializer(many=True)},
    )
    @action(methods=["get"], detail=False, url_path="country", url_name="country")
    @method_decorator(cache_page(60))
    def country(self, request):
        country_objs = data.api.country.get_list(module=self.module)

        serializer = CountryWithRegionsSerializer(
            country_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)
