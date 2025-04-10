from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import user.api.event
from comunicat.rest.serializers.event import (
    EventSerializer,
    RegistrationSerializer,
    CreateRegistrationSerializer,
    ListEventSerializer,
    DestroyRegistrationSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet
import event.api
import event.api.registration


class EventResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class EventAPI(ComuniCatViewSet):
    serializer_class = EventSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = EventResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=ListEventSerializer,
        responses={200: EventSerializer(many=True)},
    )
    @method_decorator(cache_page(1))
    def list(self, request):
        serializer = ListEventSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data.get("token")
        user_obj = (
            request.user
            if request.user.is_authenticated
            else (
                user.api.event.get_user_by_events_signup_token(token=token)
                if token
                else None
            )
        )

        event_objs = event.api.get_list(
            request_user_id=user_obj.id if user_obj else None,
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(event_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class RegistrationAPI(ComuniCatViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"event-registration.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateRegistrationSerializer,
        responses={200: RegistrationSerializer, 401: Serializer()},
    )
    def create(self, request):
        serializer = CreateRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        token = serializer.validated_data.get("token")
        user_obj = (
            request.user
            if request.user.is_authenticated
            else (
                user.api.event.get_user_by_events_signup_token(token=token)
                if token
                else None
            )
        )

        if not user_obj:
            return Response(status=401)

        registration_objs = event.api.registration.create(
            event_id=validated_data["event_id"],
            user_id=validated_data["user_id"],
            request_user_id=user_obj.id,
            module=self.module,
        )

        serializer = self.serializer_class(
            registration_objs, context={"module": self.module}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        query_serializer=DestroyRegistrationSerializer,
        responses={204: Serializer(), 401: Serializer()},
    )
    def destroy(self, request, id):
        serializer = DestroyRegistrationSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data.get("token")
        user_obj = (
            request.user
            if request.user.is_authenticated
            else (
                user.api.event.get_user_by_events_signup_token(token=token)
                if token
                else None
            )
        )

        if not user_obj:
            return Response(status=401)

        is_deleted = event.api.registration.delete(
            registration_id=id, request_user_id=user_obj.id, module=self.module
        )

        if not is_deleted:
            return Response(status=401)

        return Response(status=204)
