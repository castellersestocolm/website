import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import activity.api.program
import activity.api.program_course_registration
from comunicat.rest.serializers.activity import (
    ProgramCourseRegistrationSlimSerializer, ProgramSerializer)
from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class ProgramResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProgramCourseRegistrationResultsSetPagination(PageNumberPagination):
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
    @method_decorator(cache_page(60))
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


class ProgramCourseRegistrationAPI(ComuniCatViewSet):
    serializer_class = ProgramCourseRegistrationSlimSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ProgramCourseRegistrationResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={
            200: ProgramCourseRegistrationSlimSerializer(many=True),
            400: Serializer(),
        },
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        program_course_registrations_objs = (
            activity.api.program_course_registration.get_list(
                module=self.module,
                user_id=request.user.id,
                for_family=True,
            )
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(
            program_course_registrations_objs, request
        )
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
