import calendar
import datetime

from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import user.api.event
from comunicat.consts import PERMISSIONS_BY_LEVEL
from comunicat.rest.serializers.event import (
    EventSerializer,
    RegistrationSerializer,
    CreateRegistrationSerializer,
    ListEventSerializer,
    DestroyRegistrationSerializer,
    ListEventCalendarSerializer,
    ListRegistrationSerializer,
    RegistrationSlimSerializer,
    EventWithCountsSerializer,
    PageEventSerializer,
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
    def list(self, request):
        serializer = ListEventSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        for_musicians = (
            request.query_params.get("for_musicians").lower() == "true"
            if "for_musicians" in request.query_params
            else None
        )

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

        with_counts = serializer.validated_data.get("with_counts", False)

        event_objs = event.api.get_list(
            request_user_id=user_obj.id if user_obj else None,
            module=self.module,
            date_from=serializer.validated_data.get("date_from"),
            date_to=serializer.validated_data.get("date_to"),
            with_counts=with_counts,
            for_musicians=for_musicians,
        )

        serializer_class = (
            EventWithCountsSerializer if with_counts else self.serializer_class
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(event_objs, request)
        serializer = serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        responses={200: EventSerializer(), 404: Serializer()},
    )
    def retrieve(self, request, id):
        event_obj = event.api.get(
            event_id=id,
            module=self.module,
        )

        if not event_obj:
            return Response(status=404)

        serializer = self.serializer_class(event_obj, context={"module": self.module})
        return Response(serializer.data)

    @swagger_auto_schema(
        query_serializer=PageEventSerializer,
        responses={200: EventSerializer(), 404: Serializer()},
    )
    @action(methods=["get"], detail=False, url_path="page", url_name="page")
    @method_decorator(cache_page(60))
    def page(self, request):
        serializer = PageEventSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        event_obj = event.api.get(
            date=serializer.validated_data["date"],
            code=serializer.validated_data["code"],
            module=self.module,
        )

        if not event_obj:
            return Response(status=404)

        serializer = self.serializer_class(event_obj, context={"module": self.module})
        return Response(serializer.data)


class CalendarAPI(ComuniCatViewSet):
    serializer_class = EventSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=ListEventCalendarSerializer,
        responses={200: EventSerializer(many=True)},
    )
    def list(self, request):
        serializer = ListEventCalendarSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        # TODO: Add clean validation on serializer
        if (
            "date_from" in serializer.validated_data
            and "date_to" in serializer.validated_data
        ):
            date_from = serializer.validated_data["date_from"]
            date_to = serializer.validated_data["date_to"]
        else:
            year = serializer.validated_data.get("year")
            month = serializer.validated_data.get("month")

            if not year or not month:
                today = timezone.localdate()
                year = today.year
                month = today.month

            __, day_last = calendar.monthrange(year=year, month=month)

            date_from = datetime.date(year=year, month=month, day=1)
            date_to = datetime.date(year=year, month=month, day=day_last)

        event_objs = event.api.get_list(
            request_user_id=request.user.id if request.user.is_authenticated else None,
            module=self.module,
            date_from=date_from,
            date_to=date_to,
        )

        serializer = self.serializer_class(
            event_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)


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
            status=validated_data.get("status"),
        )

        serializer = self.serializer_class(
            registration_objs, context={"module": self.module}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        query_serializer=DestroyRegistrationSerializer(),
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

    @swagger_auto_schema(
        query_serializer=ListRegistrationSerializer,
        responses={200: RegistrationSlimSerializer(many=True), 400: Serializer()},
    )
    def list(self, request):
        serializer = ListRegistrationSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        if not request.user.is_authenticated:
            return Response(status=400)

        for_admin = (
            serializer.validated_data.get("for_admin", False)
            and request.user.permission_level
            >= PERMISSIONS_BY_LEVEL["event"]["registration"]["list"]
        )

        registration_objs = event.api.registration.get_list(
            event_id=serializer.validated_data["event_id"],
            module=self.module,
            user_id=request.user.id,
            for_admin=for_admin,
        )

        serializer = RegistrationSlimSerializer(
            registration_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)
