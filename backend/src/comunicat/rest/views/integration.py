from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from comunicat.rest.serializers.integration import (
    IntegrationGoogleWalletPassLoyaltySerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from integration.api.google.wallet import get_pass_loyalty_url


class IntegrationGoogleWalletAPI(ComuniCatViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={
            200: IntegrationGoogleWalletPassLoyaltySerializer(),
            400: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["get"], detail=False, url_path="pass/loyalty", url_name="pass_loyalty"
    )
    def pass_loyalty(self, request):
        if not request.user.is_authenticated:
            return Response(status=401)

        pass_loyalty_url = get_pass_loyalty_url(
            user_id=request.user.id, module=self.module
        )

        if not pass_loyalty_url:
            return Response(status=400)

        serializer = IntegrationGoogleWalletPassLoyaltySerializer(
            {"url": pass_loyalty_url}, context={"module": self.module}
        )
        return Response(serializer.data)
