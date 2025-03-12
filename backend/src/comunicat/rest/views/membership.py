from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.serializers import Serializer
from rest_framework.response import Response

from comunicat.rest.serializers.membership import MembershipSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import membership.api


class MembershipAPI(ComuniCatViewSet):
    serializer_class = MembershipSerializer
    permission_classes = (permissions.AllowAny,)
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

        serializer = self.serializer_class(
            membership_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)
