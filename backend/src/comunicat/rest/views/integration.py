from uuid import UUID

from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import user.api.integration
from comunicat.rest.serializers.integration import (
    IntegrationAppleWalletPassLoyaltyRequestSerializer,
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
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
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
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
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
        request_body=IntegrationAppleWalletPassLoyaltyRequestSerializer,
        responses={
            200: Serializer(),
            400: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["get"], detail=False, url_path="pass/loyalty", url_name="pass_loyalty"
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def pass_loyalty(self, request):
        serializer = IntegrationAppleWalletPassLoyaltyRequestSerializer(
            data=request.GET
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        token = validated_data.get("token")
        user_obj = (
            request.user
            if request.user.is_authenticated
            else (
                user.api.integration.get_user_by_integration_apple_wallet_token(
                    token=token
                )
                if token
                else None
            )
        )

        if not user_obj:
            return Response(status=401)

        pass_loyalty_bundle = get_pass_loyalty_bundle(
            user_id=user_obj.id, module=self.module
        )

        if not pass_loyalty_bundle:
            return Response(status=400)

        response = HttpResponse(pass_loyalty_bundle.getvalue())
        response["Content-Type"] = "application/vnd.apple.pkpass"
        response["Content-Disposition"] = "attachment; filename=loyalty.pkpass"

        return response
