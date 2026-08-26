import logging

from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import consent.api
import payment.api.entity
from comunicat.rest.serializers.consent import (
    CreateEntityConsentsSerializer,
    EntityConsentSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet
from consent.fields import Consent

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

        consent.api.update_consents(
            entity_id=entity_obj.id,
            consents=[
                Consent(
                    consent_type=entity_consent["type"],
                    is_active=entity_consent["is_active"],
                    newsletter_id=entity_consent.get("newsletter_id"),
                )
                for entity_consent in validated_data["consents"]
            ],
            module=self.module,
        )

        return Response(status=201)

    @swagger_auto_schema(
        responses={200: EntityConsentSerializer(many=True)},
    )
    def list(self, request):
        if not request.user.is_authenticated:
            return Response(status=401)

        entity_consent_objs = consent.api.get_list(
            user_id=request.user.id,
            module=self.module,
        )

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(entity_consent_objs, request)
        serializer = self.serializer_class(
            result_page, context={"module": self.module}, many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        responses={204: Serializer(), 401: Serializer(), 403: Serializer()},
    )
    def destroy(self, request, id):
        if not request.user.is_authenticated:
            return Response(status=401)

        is_deleted = consent.api.remove_consent(
            consent_id=id, user_id=request.user.id, module=self.module
        )

        if not is_deleted:
            return Response(status=403)

        return Response(status=204)
