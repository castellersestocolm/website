from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.serializers import Serializer
from rest_framework.response import Response

from comunicat.rest.serializers.payment import PaymentSerializer

from comunicat.rest.viewsets import ComuniCatViewSet
import payment.api


class PaymentAPI(ComuniCatViewSet):
    serializer_class = PaymentSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: PaymentSerializer(many=True), 400: Serializer()},
    )
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        membership_objs = payment.api.get_list(
            user_id=request.user.id, module=self.module
        )

        serializer = self.serializer_class(
            membership_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)
