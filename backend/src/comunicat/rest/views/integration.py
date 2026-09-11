from uuid import UUID

from django.http import HttpResponse
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from comunicat.rest.serializers.integration import (
    IntegrationGoogleWalletPassEventSerializer,
    IntegrationGoogleWalletPassLoyaltySerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from integration.api.apple.wallet import get_pass_loyalty_bundle
from integration.api.google.wallet import get_pass_event_url, get_pass_loyalty_url


class IntegrationGoogleWalletAPI(ComuniCatViewSet):
    permission_classes = (permissions.AllowAny,)
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

    # TODO: Check if further checks with a token need to be done
    @swagger_auto_schema(
        responses={
            200: IntegrationGoogleWalletPassEventSerializer(),
            400: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["get"],
        detail=False,
        url_path=r"pass/event/(?P<registration_id>[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12})",
        url_name="pass_event",
    )
    def pass_event(self, request, registration_id: UUID):
        pass_event_url = get_pass_event_url(registration_id=registration_id)

        if not pass_event_url:
            return Response(status=400)

        serializer = IntegrationGoogleWalletPassEventSerializer(
            {"url": pass_event_url}, context={"module": self.module}
        )
        return Response(serializer.data)


class IntegrationAppleWalletAPI(ComuniCatViewSet):
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={
            200: Serializer(),
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

        from comunicat.enums import Module

        pass_loyalty_bundle = get_pass_loyalty_bundle(
            user_id=request.user.id, module=Module.TOWERS
        )

        if not pass_loyalty_bundle:
            return Response(status=400)

        response = HttpResponse(pass_loyalty_bundle.getvalue())
        response["Content-Type"] = "application/vnd.apple.pkpass"
        response["Content-Disposition"] = "attachment; filename=loyalty.pkpass"

        return response
