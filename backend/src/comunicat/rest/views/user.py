from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import exceptions, permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer
from rest_framework.decorators import action
from rest_framework.response import Response

import user.api
import user.api.family
import user.api.family_member
import user.api.family_member_request
from comunicat.consts import PERMISSIONS_BY_LEVEL

from comunicat.rest.serializers.user import (
    UserSerializer,
    LoginSerializer,
    CreateSerializer,
    UpdateFamilyMemberSerializer,
    FamilyMemberSerializer,
    CreateFamilyMemberSerializer,
    UserChangeApplySerializer,
    UserChangeUpdateSerializer,
    UpdateSerializer,
    CreateFamilyMemberRequestSerializer,
    FamilyMemberRequestSlimSerializer,
    FamilyMemberRequestExtraSlimSerializer,
    UserPasswordChangeApplySerializer,
    FamilySerializer,
    ListFamilySerializer,
    UserExtraSlimSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from user.enums import FamilyMemberRole, FamilyMemberStatus


class UserAPI(ComuniCatViewSet):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    def get_throttles(self):
        if self.action in (
            "login",
            "create",
            "partial_update",
            "request_password",
            "password",
            "request_verify",
            "verify",
        ):
            self.throttle_scope = f"user.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateSerializer,
        responses={201: Serializer()},
    )
    def create(self, request):
        serializer = CreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        validated_data.pop("password2")
        user.api.register(**validated_data, module=self.module)

        return Response(status=201)

    @swagger_auto_schema(
        request_body=UpdateSerializer,
        responses={202: Serializer(), 401: Serializer()},
    )
    def partial_update(self, request, id):
        if not request.user.is_authenticated or str(request.user.id) != id:
            return Response(status=401)

        # Must have consented when the user was created
        if request.user.is_adult:
            request.data["consent_pictures"] = True

        serializer = UpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # TODO: Only allow language and height unless registration not completed

        user.api.update(id=id, **validated_data, module=self.module)

        return Response(status=202)

    @swagger_auto_schema(
        request_body=LoginSerializer,
        responses={
            200: UserSerializer,
            400: Serializer(),
            401: Serializer(),
        },
    )
    @action(methods=["post"], detail=False, url_path="login", url_name="login")
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            user_obj = user.api.login(
                request=request, **validated_data, module=self.module
            )
        except exceptions.AuthenticationFailed:
            return Response(status=401)

        if user_obj:
            serializer = self.serializer_class(
                user_obj, context={"module": self.module}
            )
            return Response(serializer.data)

        return Response(status=400)

    @swagger_auto_schema(
        methods=["post"], request_body=Serializer(), responses={200: Serializer()}
    )
    @action(methods=["post"], detail=False, url_name="logout", url_path="logout")
    def logout(self, request):
        user.api.logout(request=request)
        return Response(status=200)

    @swagger_auto_schema(
        request_body=UserChangeUpdateSerializer, responses={200: Serializer()}
    )
    @action(
        methods=["post"],
        detail=False,
        url_name="request-password",
        url_path="request-password",
    )
    def request_password(self, request):
        serializer = UserChangeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user.api.request_password(email=validated_data["email"], module=self.module)

        return Response(status=200)

    @swagger_auto_schema(
        request_body=UserPasswordChangeApplySerializer,
        responses={200: UserSerializer, 400: Serializer()},
    )
    @action(methods=["post"], detail=False, url_path="password", url_name="password")
    def password(self, request):
        serializer = UserPasswordChangeApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        validated_data.pop("password2")
        user_obj = user.api.set_password(
            **validated_data, module=self.module, request=request
        )

        if user_obj:
            serializer = self.serializer_class(
                user_obj, context={"module": self.module}
            )
            return Response(serializer.data)

        return Response(status=400)

    @swagger_auto_schema(responses={204: Serializer(), 200: UserSerializer})
    @action(methods=["get"], detail=False, url_path="me", url_name="me")
    @method_decorator(ensure_csrf_cookie)
    def me(self, request):
        if request.user.is_authenticated:
            user_obj = user.api.get(user_id=request.user.id)

            if not hasattr(user_obj, "family_member"):
                user.api.family.create_for_user(user_id=user_obj.id)
                user_obj = user.api.get(user_id=request.user.id)

            serializer = self.serializer_class(
                user_obj, context={"module": self.module}
            )
            return Response(serializer.data)

        return Response(status=204)

    @swagger_auto_schema(
        request_body=UserChangeUpdateSerializer, responses={200: Serializer()}
    )
    @action(
        methods=["post"],
        detail=False,
        url_path="request-verify",
        url_name="request-verify",
    )
    def request_verify(self, request):
        serializer = UserChangeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user.api.request_verify(email=validated_data["email"], module=self.module)

        return Response(status=200)

    @swagger_auto_schema(
        request_body=UserChangeApplySerializer,
        responses={200: UserSerializer, 400: Serializer()},
    )
    @action(methods=["post"], detail=False, url_path="verify", url_name="verify")
    def verify(self, request):
        serializer = UserChangeApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        user_obj = user.api.set_verify(
            **validated_data, module=self.module, request=request
        )

        if user_obj:
            serializer = self.serializer_class(
                user_obj, context={"module": self.module}
            )
            return Response(serializer.data)

        return Response(status=400)

    @swagger_auto_schema(
        responses={200: UserExtraSlimSerializer(many=True), 400: Serializer()},
    )
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=400)

        if not request.user.permission_level >= PERMISSIONS_BY_LEVEL["user"]["user"]["list"]:
            return Response(status=400)

        user_objs = user.api.get_list(
            modules=[self.module],
        )

        serializer = UserExtraSlimSerializer(
            user_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)


class UserFamilyAPI(ComuniCatViewSet):
    serializer_class = FamilySerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        query_serializer=ListFamilySerializer,
        responses={
            200: FamilySerializer(),
            401: Serializer(),
        },
    )
    def list(self, request):
        serializer = ListFamilySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data.get("token")
        user_obj = (
            request.user
            if request.user.is_authenticated
            else (
                user.api.event.get_user_by_events_signup_token(token=token)
                if token
                else None
            )
        )

        if not user_obj:
            return Response(status=401)

        family_obj = user.api.family.get_for_user(user_id=user_obj.id)

        serializer = self.serializer_class(
            family_obj, context={"module": self.module, "user": request.user}
        )
        return Response(serializer.data)


class UserFamilyMemberAPI(ComuniCatViewSet):
    serializer_class = FamilyMemberSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create", "update"):
            self.throttle_scope = f"user-family-member.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=UpdateFamilyMemberSerializer,
        responses={202: Serializer(), 400: Serializer()},
    )
    def update(self, request, id):
        serializer = UpdateFamilyMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        family_member_obj = user.api.family_member.update(
            id=id, user_id=request.user.id, **validated_data
        )

        if not family_member_obj:
            return Response(status=400)

        return Response(status=202)

    @swagger_auto_schema(
        request_body=CreateFamilyMemberSerializer,
        responses={201: FamilyMemberSerializer, 400: Serializer()},
    )
    def create(self, request):
        serializer = CreateFamilyMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        family_member_obj = user.api.family_member.create(
            user_id=request.user.id,
            module=self.module,
            **validated_data,
            role=FamilyMemberRole.MEMBER,
            status=FamilyMemberStatus.ACTIVE,
        )

        if not family_member_obj:
            return Response(status=400)

        serializer = self.serializer_class(
            family_member_obj, context={"module": self.module}
        )
        return Response(serializer.data, status=201)

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer()},
    )
    def destroy(self, request, id):
        is_deleted = user.api.family_member.delete(id=id, user_id=request.user.id)

        if not is_deleted:
            return Response(status=401)

        return Response(status=204)


class UserFamilyMemberRequestAPI(ComuniCatViewSet):
    serializer_class = FamilyMemberRequestSlimSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"user-family-member-request.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateFamilyMemberRequestSerializer,
        responses={
            201: FamilyMemberRequestSlimSerializer,
            400: Serializer(),
            401: Serializer(),
        },
    )
    def create(self, request):
        if not request.user.is_authenticated:
            return Response(status=401)

        serializer = CreateFamilyMemberRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            family_member_request_obj = user.api.family_member_request.create(
                user_id=request.user.id,
                module=self.module,
                **validated_data,
            )
        except ValidationError as e:
            return Response({"error": e.detail}, status=400)

        if not family_member_request_obj:
            return Response(status=401)

        serializer = self.serializer_class(
            family_member_request_obj, context={"module": self.module}
        )
        return Response(serializer.data, status=201)

    @swagger_auto_schema(
        responses={
            200: FamilyMemberRequestSlimSerializer(many=True),
            401: Serializer(),
        },
    )
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=401)

        family_member_request_objs = user.api.family_member_request.get_list_sent(
            user_id=request.user.id,
            module=self.module,
        )

        serializer = self.serializer_class(
            family_member_request_objs, many=True, context={"module": self.module}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        responses={
            200: FamilyMemberRequestExtraSlimSerializer(many=True),
            401: Serializer(),
        },
    )
    @action(methods=["get"], detail=False, url_path="received", url_name="received")
    def received(self, request):
        if not request.user.is_authenticated:
            return Response(status=401)

        family_member_request_objs = user.api.family_member_request.get_list_received(
            user_id=request.user.id,
            module=self.module,
        )

        serializer = FamilyMemberRequestExtraSlimSerializer(
            family_member_request_objs, many=True, context={"module": self.module}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer()},
    )
    @action(methods=["delete"], detail=True, url_path="cancel", url_name="cancel")
    def cancel(self, request, id):
        is_deleted = user.api.family_member_request.delete(
            id=id, user_id=request.user.id, module=self.module
        )

        if not is_deleted:
            return Response(status=401)

        return Response(status=204)

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer()},
    )
    @action(methods=["post"], detail=True, url_path="accept", url_name="accept")
    def accept(self, request, id):
        is_deleted = user.api.family_member_request.accept(
            id=id, user_id=request.user.id, module=self.module
        )

        if not is_deleted:
            return Response(status=401)

        return Response(status=204)

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer()},
    )
    @action(methods=["delete"], detail=True, url_path="reject", url_name="reject")
    def reject(self, request, id):
        is_deleted = user.api.family_member_request.reject(
            id=id, user_id=request.user.id, module=self.module
        )

        if not is_deleted:
            return Response(status=401)

        return Response(status=204)
