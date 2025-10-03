from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

import user.api
import user.api.family
import user.api.family_member
import user.api.family_member_request
from comunicat.rest.permissions import AllowLevelAdmin

from comunicat.rest.serializers.admin import (
    AdminUserSerializer,
    AdminUserRequestSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from legal.enums import TeamType


class AdminUserResultsSetPagination(PageNumberPagination):
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
    # @method_decorator(cache_page(1))
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
        for user_obj in user_objs:
            print(user_obj.members.all())

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
        request_body=AdminUserRequestSerializer,
        responses={202: Serializer(), 403: Serializer()},
    )
    def partial_update(self, request, id):
        serializer = AdminUserRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user.api.update(user_id=id, **validated_data, module=self.module)

        return Response(status=202)
