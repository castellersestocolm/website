from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from comunicat.rest.serializers.event import (
    EventSerializer,
    RegistrationSerializer,
    CreateRegistrationSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet
import event.api
import event.api.registration


class EventAPI(ComuniCatViewSet):
    serializer_class = EventSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: EventSerializer(many=True)},
    )
    @method_decorator(cache_page(1))
    def list(self, request):
        event_objs = event.api.get_list(
            request_user_id=request.user.id if request.user.is_authenticated else None,
            module=self.module,
        )

        serializer = self.serializer_class(
            event_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)


class RegistrationAPI(ComuniCatViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"event-registration.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateRegistrationSerializer,
        responses={200: RegistrationSerializer},
    )
    def create(self, request):
        serializer = CreateRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        registration_objs = event.api.registration.create(
            **validated_data, request_user_id=request.user.id, module=self.module
        )

        serializer = self.serializer_class(
            registration_objs, context={"module": self.module}
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer()},
    )
    def destroy(self, request, id):
        is_deleted = event.api.registration.delete(
            registration_id=id, request_user_id=request.user.id, module=self.module
        )

        if not is_deleted:
            return Response(status=401)

        return Response(status=204)
