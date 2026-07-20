import logging

from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import consent.api
import payment.api.entity
from comunicat.rest.serializers.consent import (CreateEntityConsentsSerializer,
                                                EntityConsentSerializer)
from comunicat.rest.viewsets import ComuniCatViewSet

_log = logging.getLogger(__name__)


class EntityConsentResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class EntityConsentAPI(ComuniCatViewSet):
    serializer_class = EntityConsentSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = EntityConsentResultsSetPagination
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"entity-consent.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateEntityConsentsSerializer,
        responses={
            201: Serializer(),
        },
    )
    def create(self, request):
        serializer = CreateEntityConsentsSerializer(
            data=request.data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        if request.user.is_authenticated:
            entity_obj = payment.api.entity.get_entity_by_key(user_id=request.user.id)
        else:
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

            # If the entity is associated with a user but they are not logged in skip the changes
            if entity_obj.user:
                return Response(status=201)

        consent.api.add_consents(
            entity_id=entity_obj.id,
            consent_types=[consent["type"] for consent in validated_data["consents"]],
            newsletter_ids=[
                consent["newsletter_id"]
                for consent in validated_data["consents"]
                if consent.get("newsletter_id") is not None
            ],
        )

        return Response(status=201)
