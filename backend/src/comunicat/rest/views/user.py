from rest_framework import exceptions, permissions
from rest_framework.viewsets import ViewSet
from drf_yasg.utils import swagger_auto_schema
from rest_framework.serializers import Serializer
from rest_framework.decorators import action
from rest_framework.response import Response

import user.api


from comunicat.rest.serializers.user import UserSerializer


class UserAPI(ViewSet):
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "user"

    @swagger_auto_schema(
        responses={201: Serializer()},
    )
    def create(self, request):
        return Response(status=201)

    @swagger_auto_schema(
        responses={
            200: UserSerializer,
        },
    )
    @action(methods=["post"], detail=False, url_path="login", url_name="login")
    def login(self, request):
        return Response(status=200)

    @swagger_auto_schema(
        methods=["post"], request_body=Serializer(), responses={200: Serializer()}
    )
    @action(methods=["post"], detail=False, url_name="logout", url_path="logout")
    def logout(self, request):
        return Response(status=200)

    @swagger_auto_schema(responses={200: Serializer()})
    @action(
        methods=["post"],
        detail=False,
        url_name="password-forgot",
        url_path="password-forgot",
    )
    def password_forgot(self, request):
        return Response(status=200)

    @swagger_auto_schema(responses={204: Serializer(), 200: UserSerializer})
    @action(methods=["get"], detail=False, url_path="me", url_name="me")
    def me(self, request):
        if request.user.is_authenticated:
            user_obj = user.api.get(id=request.user.id)
            serializer = self.serializer_class(user_obj)
            return Response(serializer.data)
        else:
            return Response(status=204)
