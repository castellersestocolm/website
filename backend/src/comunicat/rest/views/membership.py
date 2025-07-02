from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

from comunicat.rest.serializers.membership import (
    MembershipSerializer,
    MembershipRenewSerializer,
    MembershipRenewRequestSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet
import membership.api
import membership.api.renew


class MembershipResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class MembershipAPI(ComuniCatViewSet):
    serializer_class = MembershipSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = MembershipResultsSetPagination
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: MembershipSerializer(many=True), 400: Serializer()},
    )
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        membership_objs = membership.api.get_list(
            user_id=request.user.id, module=self.module
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(membership_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        method="get",
        responses={
            200: MembershipRenewSerializer(many=True),
            400: Serializer(),
        },
    )
    @swagger_auto_schema(
        method="post",
        request_body=MembershipRenewRequestSerializer,
        responses={
            200: MembershipSerializer(),
            400: Serializer(),
        },
    )
    @action(methods=["get", "post"], detail=False, url_path="renew", url_name="renew")
    def renew(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        if request.method == "POST":
            serializer = MembershipRenewRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            membership_obj = membership.api.create_or_update(
                user_id=request.user.id, modules=validated_data["modules"]
            )

            serializer = MembershipSerializer(
                membership_obj, context={"module": self.module}
            )
            return Response(serializer.data)

        membership_options = membership.api.renew.get_options(user_id=request.user.id)

        serializer = MembershipRenewSerializer(
            membership_options, many=True, context={"module": self.module}
        )
        return Response(serializer.data)
