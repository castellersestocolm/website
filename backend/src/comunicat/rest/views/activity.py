import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import activity.api.course
import activity.api.program
import activity.api.program_course_registration
from comunicat.rest.serializers.activity import (
    CreateProgramCourseRegistrationSerializer,
    ListProgramCourseSerializer,
    ProgramCourseRegistrationSerializer,
    ProgramCourseRegistrationSlimSerializer,
    ProgramCourseSerializer,
    ProgramSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from payment.api.entity import get_entity_by_key

_log = logging.getLogger(__name__)


class ProgramResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProgramCourseResultsSetPagination(PageNumberPagination):
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


class ProgramCourseAPI(ComuniCatViewSet):
    serializer_class = ProgramCourseSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ProgramCourseResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=ListProgramCourseSerializer(),
        responses={200: ProgramCourseSerializer(many=True)},
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def list(self, request):
        serializer = ListProgramCourseSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        filter_program_types = serializer.validated_data.get(
            "filter_program_types", None
        )

        program_course_objs = activity.api.course.get_list(
            module=self.module,
            request_user_id=request.user.id if request.user.is_authenticated else None,
            filter_program_types=filter_program_types,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(program_course_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class ProgramCourseRegistrationAPI(ComuniCatViewSet):
    serializer_class = ProgramCourseRegistrationSlimSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ProgramCourseRegistrationResultsSetPagination
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"program-course-registration.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateProgramCourseRegistrationSerializer,
        responses={200: ProgramCourseRegistrationSerializer, 401: Serializer()},
    )
    def create(self, request):
        serializer = CreateProgramCourseRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_obj = request.user if request.user.is_authenticated else None

        if not user_obj:
            return Response(status=401)

        entity_obj = get_entity_by_key(user_id=validated_data["user_id"])

        registration_objs = activity.api.course.register_entity(
            course_ids=[validated_data["course_id"]],
            entity_id=entity_obj.id,
        )

        if registration_objs:
            registration_obj = registration_objs[0]
        else:
            return Response(status=401)

        serializer = self.serializer_class(
            registration_obj, context={"module": self.module}
        )
        return Response(serializer.data)

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

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer(), 403: Serializer()},
    )
    def destroy(self, request, id):
        if not request.user.is_authenticated:
            return Response(status=401)

        is_deleted = activity.api.program_course_registration.delete(
            registration_id=id, user_id=request.user.id, module=self.module
        )

        if not is_deleted:
            return Response(status=403)

        return Response(status=204)
