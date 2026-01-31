from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

import user.api
import user.api.family
import user.api.family_member
import user.api.family_member_request
import order.api
import event.api
import towers.api
import towers.api.statistics
import history.api.history_event
from comunicat.rest.permissions import AllowLevelAdmin, AllowLevelSuperAdmin

from comunicat.rest.serializers.admin import (
    AdminUserSerializer,
    AdminUserRequestSerializer,
    AdminOrderSerializer,
    AdminEventSerializer,
    AdminListEventSerializer,
    AdminTowersEventSerializer,
    AdminTowersStatsPositionSerializer,
    AdminHistoryEventSerializer,
    AdminHistoryEventUpdateSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from legal.enums import TeamType


class AdminUserResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminOrderResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminEventResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminTowersStatsResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminHistoryEventResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserAPI(ComuniCatViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = (AllowLevelAdmin,)
    pagination_class = AdminUserResultsSetPagination
    ordering_fields = ["created_at", "firstname", "lastname"]
    filterset_fields = ["can_manage"]
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: AdminUserSerializer(many=True), 403: Serializer()},
    )
    @method_decorator(cache_page(1))
    def list(self, request):
        ordering = request.query_params.get("ordering")
        if ordering:
            ordering = ordering.split(",")

        is_adult = (
            request.query_params.get("is_adult").lower() == "true"
            if "is_adult" in request.query_params
            else None
        )

        is_musician = (
            request.query_params.get("is_musician").lower() == "true"
            if "is_musician" in request.query_params
            else None
        )

        user_objs = user.api.get_list(
            modules=[self.module],
            with_orders=True,
            with_teams=True,
            with_products=True,
            ordering=ordering,
        )

        if is_adult is not None:
            user_objs = [
                user_obj for user_obj in user_objs if user_obj.is_adult == is_adult
            ]

        if is_musician is not None:
            user_objs = [
                user_obj
                for user_obj in user_objs
                if any(
                    [
                        member_obj.team.type == TeamType.MUSICIANS
                        for member_obj in user_obj.members.all()
                    ]
                )
            ]

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(user_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        responses={200: AdminUserSerializer(), 403: Serializer()},
    )
    @method_decorator(cache_page(1))
    def retrieve(self, request, id):
        user_obj = user.api.get(
            user_id=id,
            module=self.module,
        )

        if not user_obj:
            return Response(status=404)

        serializer = self.serializer_class(user_obj, context={"module": self.module})
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=AdminUserRequestSerializer,
        responses={202: Serializer(), 403: Serializer()},
    )
    def partial_update(self, request, id):
        serializer = AdminUserRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user.api.update(user_id=id, **validated_data, module=self.module)

        return Response(status=202)


class AdminOrderAPI(ComuniCatViewSet):
    serializer_class = AdminOrderSerializer
    permission_classes = (AllowLevelAdmin,)
    pagination_class = AdminOrderResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: AdminOrderSerializer(many=True), 403: Serializer()},
    )
    @method_decorator(cache_page(60))
    def list(self, request):
        order_objs = order.api.get_list(
            module=self.module,
            for_admin=True,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(order_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class AdminEventAPI(ComuniCatViewSet):
    serializer_class = AdminEventSerializer
    permission_classes = (AllowLevelAdmin,)
    pagination_class = AdminEventResultsSetPagination
    ordering_fields = [
        "time_from",
    ]
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=AdminListEventSerializer,
        responses={200: AdminEventSerializer(many=True), 403: Serializer()},
    )
    @method_decorator(cache_page(1))
    def list(self, request):
        serializer = AdminListEventSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        for_musicians = (
            request.query_params.get("for_musicians").lower() == "true"
            if "for_musicians" in request.query_params
            else None
        )

        event_objs = event.api.get_list(
            module=self.module,
            date_from=serializer.validated_data.get("date_from"),
            date_to=serializer.validated_data.get("date_to"),
            with_counts=False,
            for_musicians=for_musicians,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(event_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)


class AdminTowersEventAPI(ComuniCatViewSet):
    serializer_class = AdminTowersEventSerializer
    permission_classes = (AllowLevelAdmin,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: AdminTowersEventSerializer(), 403: Serializer()},
    )
    @method_decorator(cache_page(60))
    def retrieve(self, request, id):
        event_towers = towers.api.get_towers_for_event(event_id=id)

        serializer = self.serializer_class(
            {"towers": event_towers}, context={"module": self.module}
        )
        return Response(serializer.data)


class AdminTowersStatsAPI(ComuniCatViewSet):
    permission_classes = (AllowLevelAdmin,)
    pagination_class = AdminTowersStatsResultsSetPagination

    @swagger_auto_schema(
        responses={
            200: AdminTowersStatsPositionSerializer(many=True),
            403: Serializer(),
        },
    )
    @action(methods=["get"], detail=False, url_path="position", url_name="position")
    @method_decorator(cache_page(60))
    def position(self, request):
        position_stats_towers = towers.api.statistics.get_positions()

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(position_stats_towers, request)
        serializer = AdminTowersStatsPositionSerializer(
            result_page, many=True, context={"module": self.module}
        )
        return paginator.get_paginated_response(serializer.data)


class AdminHistoryEventAPI(ComuniCatViewSet):
    permission_classes = (AllowLevelSuperAdmin,)
    pagination_class = AdminHistoryEventResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: AdminHistoryEventSerializer(many=True), 403: Serializer()},
    )
    @method_decorator(cache_page(1))
    def list(self, request):
        history_event_objs = history.api.history_event.get_list(
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(history_event_objs, request)
        serializer = AdminHistoryEventSerializer(
            result_page, many=True, context={"module": self.module}
        )
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        request_body=AdminHistoryEventUpdateSerializer,
        responses={202: Serializer(), 403: Serializer()},
    )
    def create(self, request):
        serializer = AdminHistoryEventUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        history_event_obj = history.api.history_event.create(
            **validated_data, module=self.module
        )

        serializer = AdminHistoryEventSerializer(
            history_event_obj, context={"module": self.module}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=AdminHistoryEventUpdateSerializer,
        responses={202: Serializer(), 403: Serializer()},
    )
    def partial_update(self, request, id):
        serializer = AdminHistoryEventUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        history.api.history_event.update(
            history_event_id=id, **validated_data, module=self.module
        )

        return Response(status=202)

    @swagger_auto_schema(
        responses={204: Serializer(), 403: Serializer()},
    )
    def destroy(self, request, id):
        history.api.history_event.delete(history_event_id=id, module=self.module)

        return Response(status=204)
