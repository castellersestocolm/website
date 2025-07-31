from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer

import user.api
import user.api.family
import user.api.family_member
import user.api.family_member_request
from comunicat.rest.filters import TestFilter
from comunicat.rest.permissions import AllowLevelAdmin

from comunicat.rest.serializers.admin import (
    AdminUserSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet


class AdminUserResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserAPI(ComuniCatViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = (AllowLevelAdmin,)
    pagination_class = AdminUserResultsSetPagination
    ordering_fields = ["created_at", "firstname", "lastname"]
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: AdminUserSerializer(many=True), 403: Serializer()},
    )
    def list(self, request):
        ordering = request.query_params.get("ordering")
        if ordering:
            ordering = ordering.split(",")

        user_objs = user.api.get_list(modules=[self.module], ordering=ordering)

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(user_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)
