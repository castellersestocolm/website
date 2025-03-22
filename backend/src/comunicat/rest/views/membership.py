from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.serializers import Serializer
from rest_framework.response import Response

from comunicat.rest.serializers.membership import MembershipSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import membership.api


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
