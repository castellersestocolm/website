import logging

from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

import payment.api.entity
import notify.api.contact_message
from comunicat.rest.serializers.notify import (
    ContactMessageSerializer,
    CreateContactMessageSerializer,
)

from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class ContactMessageResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ContactMessageAPI(ComuniCatViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = ContactMessageResultsSetPagination
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"notify-contact-message.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateContactMessageSerializer,
        responses={
            201: ContactMessageSerializer(),
        },
    )
    def create(self, request):
        serializer = CreateContactMessageSerializer(
            data=request.data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        entity_obj = payment.api.entity.get_entity_by_key(
            email=validated_data["entity"]["email"],
            firstname=validated_data["entity"].get("firstname"),
            lastname=validated_data["entity"].get("lastname"),
            phone=(
                str(validated_data["entity"]["phone"])
                if "phone" in validated_data["entity"]
                else None
            ),
        )

        contact_message_obj = notify.api.contact_message.create(
            entity_id=entity_obj.id,
            message_type=validated_data["type"],
            message=validated_data["message"],
            context=validated_data.get("context", {}),
            module=self.module,
        )

        serializer = self.serializer_class(
            contact_message_obj, context={"module": self.module}
        )
        return Response(serializer.data, status=201)
