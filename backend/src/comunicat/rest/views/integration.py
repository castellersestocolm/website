from uuid import UUID

from django.http import HttpResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import user.api
import user.api.integration
from comunicat.enums import Module
from comunicat.rest.serializers.integration import (
    IntegrationAppleWalletPassEventRequestSerializer,
    IntegrationAppleWalletPassLoyaltyRegisterRequestSerializer,
    IntegrationAppleWalletPassLoyaltyRegisterRetrieveRequestSerializer,
    IntegrationAppleWalletPassLoyaltyRegisterRetrieveSerializer,
    IntegrationAppleWalletPassLoyaltyRequestSerializer,
    IntegrationGoogleWalletPassEventSerializer,
    IntegrationGoogleWalletPassLoyaltySerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from integration.api.apple.wallet import (
    delete_loyalty_bundle,
    get_loyalty_bundle_serial_numbers,
    get_pass_event_bundle,
    get_pass_loyalty_bundle,
    register_loyalty_bundle,
)
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
        query_serializer=IntegrationAppleWalletPassLoyaltyRequestSerializer(),
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

        user_id = request.user.is_authenticated and request.user.id
        module = self.module

        token = validated_data.get("token")
        if token:
            data = user.api.integration.get_user_data_by_integration_apple_wallet_token(
                token=token
            )
            if data:
                user_id = data["user_id"]
                module = Module(data.get("module", module))

        if not user_id:
            return Response(status=401)

        pass_loyalty_bundle = get_pass_loyalty_bundle(user_id=user_id, module=module)

        if not pass_loyalty_bundle:
            return Response(status=400)

        response = HttpResponse(pass_loyalty_bundle.getvalue())
        response["Content-Type"] = "application/vnd.apple.pkpass"
        response["Content-Disposition"] = "attachment; filename=loyalty.pkpass"

        return response

    # TODO: Check if further checks with a token need to be done
    @swagger_auto_schema(
        query_serializer=IntegrationAppleWalletPassEventRequestSerializer(),
        responses={
            200: Serializer(),
            400: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["get"],
        detail=False,
        url_path="pass/event",
        url_name="pass_event",
    )
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def pass_event(self, request):
        serializer = IntegrationAppleWalletPassEventRequestSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        registration_id = None

        token = validated_data.get("token")
        if token:
            data = user.api.integration.get_registration_data_by_integration_apple_wallet_token(
                token=token
            )
            if data:
                registration_id = data["registration_id"]

        if not registration_id:
            return Response(status=401)

        pass_event_bundle = get_pass_event_bundle(registration_id=registration_id)

        if not pass_event_bundle:
            return Response(status=400)

        response = HttpResponse(pass_event_bundle.getvalue())
        response["Content-Type"] = "application/vnd.apple.pkpass"
        response["Content-Disposition"] = "attachment; filename=event.pkpass"

        return response

    @swagger_auto_schema(
        query_serializer=IntegrationAppleWalletPassLoyaltyRegisterRetrieveRequestSerializer(),
        responses={
            200: Serializer(),
            204: Serializer(),
        },
    )
    @action(
        methods=["get"],
        detail=False,
        url_path=r"pass/loyalty/v1/devices/(?P<device_library_id>.*)/registrations/(?P<pass_type_id>.*)",
        url_name="pass_loyalty_registrations",
    )
    def registrations_pass_loyalty(self, request, device_library_id, pass_type_id):
        print("METHOD REGISTRATIONS", request.method)
        serializer = IntegrationAppleWalletPassLoyaltyRegisterRetrieveRequestSerializer(
            data=request.GET
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        last_updated = validated_data.get("previousLastUpdated")

        serial_numbers = get_loyalty_bundle_serial_numbers(
            device_library_id=device_library_id,
            pass_type_id=pass_type_id,
            last_updated=last_updated,
        )

        print(serial_numbers, str(int(timezone.localtime().timestamp())))

        if not serial_numbers:
            return Response(204)

        serializer = IntegrationAppleWalletPassLoyaltyRegisterRetrieveSerializer(
            {
                "serialNumbers": serial_numbers,
                "lastUpdated": str(int(timezone.localtime().timestamp())),
            },
            context={"module": self.module},
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        method="head",
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @swagger_auto_schema(
        method="get",
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @swagger_auto_schema(
        method="post",
        request_body=IntegrationAppleWalletPassLoyaltyRegisterRequestSerializer(),
        responses={
            200: Serializer(),
            201: Serializer(),
            401: Serializer(),
        },
    )
    @swagger_auto_schema(
        method="delete",
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["head", "get", "post", "delete"],
        detail=False,
        url_path=r"pass/loyalty/v1/devices/(?P<device_library_id>.*)/registrations/(?P<pass_type_id>.*)/(?P<serial_number>.*)",
        url_name="pass_loyalty_register",
    )
    def register_pass_loyalty(
        self, request, device_library_id, pass_type_id, serial_number
    ):
        print("METHOD", request.method)
        if request.method == "POST":
            print("DATA POST", request.data)
            request_header = request.headers.get("Authorization")

            if not request_header:
                print("ERROR: No header", request.headers)
                return Response(status=401)

            token = request_header.split(" ")[-1]

            user_obj = user.api.get_by_token(token=token)

            if not user_obj:
                print("ERROR: No user", token)
                return Response(status=401)

            serializer = IntegrationAppleWalletPassLoyaltyRegisterRequestSerializer(
                data=request.data
            )
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            push_token = validated_data.get("pushToken")

            __, is_created = register_loyalty_bundle(
                device_library_id=device_library_id,
                pass_type_id=pass_type_id,
                serial_number=serial_number,
                push_token=push_token,
            )

            return Response(status=201 if is_created else 200)
        elif request.method == "GET":
            print("DATA GET", request.GET)
            return Response(status=200)
        elif request.method == "HEAD":
            print("DATA HEAD", request.HEAD)
            return Response(status=200)

        delete_loyalty_bundle(pass_type_id=pass_type_id, serial_number=serial_number)

        return Response(status=200)

    @swagger_auto_schema(
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["get"],
        detail=False,
        url_path=r"pass/loyalty/v1/passes/(?P<pass_type_id>.*)/(?P<serial_number>.*)",
        url_name="pass_loyalty_update",
    )
    def update_pass_loyalty(self, request, pass_type_id, serial_number):
        request_header = request.headers.get("Authorization")

        if not request_header:
            return Response(status=401)

        token = request_header.split(" ")[-1]

        user_obj = user.api.get_by_token(token=token)

        if not user_obj:
            return Response(status=401)

        module = Module(pass_type_id.split(".")[1])

        pass_loyalty_bundle = get_pass_loyalty_bundle(
            user_id=user_obj.id, module=module
        )

        if not pass_loyalty_bundle:
            return Response(status=401)

        response = HttpResponse(pass_loyalty_bundle.getvalue())
        response["Content-Type"] = "application/vnd.apple.pkpass"
        response["Content-Disposition"] = "attachment; filename=loyalty.pkpass"

        return response

    @swagger_auto_schema(
        method="head",
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @swagger_auto_schema(
        method="get",
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @swagger_auto_schema(
        method="post",
        responses={
            200: Serializer(),
            401: Serializer(),
        },
    )
    @action(
        methods=["head", "get", "post"],
        detail=False,
        url_path=r"pass/loyalty/v1/log",
        url_name="pass_log",
    )
    def update_pass_loyalty(self, request):
        print("LOGS METHOD", request.method)
        print("LOGS1", request.data)
        print("LOGS2", request.GET)

        return Response(status=200)
