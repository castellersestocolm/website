from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

import payment.api.entity
import sponsorship.api
from comunicat.rest.serializers.sponsorship import (
    CreateEntityTierSerializer,
    EntityTierSerializer,
    SponsorshipPageSerializer,
    SponsorshipSerializer,
)
from comunicat.rest.viewsets import ComuniCatViewSet


class SponsorshipResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class EntityTierResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class SponsorshipAPI(ComuniCatViewSet):
    serializer_class = SponsorshipSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    @swagger_auto_schema(
        responses={200: SponsorshipSerializer(many=True)},
    )
    # @method_decorator(cache_page(60))
    # @method_decorator(cache_control(private=True))
    def list(self, request):
        sponsorship_objs = sponsorship.api.get_list(
            module=self.module,
        )

        serializer = self.serializer_class(
            sponsorship_objs, context={"module": self.module}, many=True
        )
        return Response(serializer.data)

    @swagger_auto_schema(
        query_serializer=SponsorshipPageSerializer(),
        responses={200: SponsorshipSerializer(), 404: Serializer()},
    )
    @action(methods=["get"], detail=False, url_path="page", url_name="page")
    @method_decorator(cache_page(60))
    @method_decorator(cache_control(private=True))
    def page(self, request):
        serializer = SponsorshipPageSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        sponsorship_obj = sponsorship.api.get(
            code=serializer.validated_data.get("code"),
            event_id=serializer.validated_data.get("event_id"),
            module=self.module,
        )

        if not sponsorship_obj:
            return Response(status=404)

        serializer = self.serializer_class(
            sponsorship_obj, context={"module": self.module}
        )
        return Response(serializer.data)


class EntityTierAPI(ComuniCatViewSet):
    serializer_class = EntityTierSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = EntityTierResultsSetPagination
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"entity-tier.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=CreateEntityTierSerializer,
        responses={
            201: Serializer(),
        },
    )
    def create(self, request):
        serializer = CreateEntityTierSerializer(
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

        # consent.api.update_consents(
        #     entity_id=entity_obj.id,
        #     consents=[
        #         Consent(
        #             consent_type=entity_consent["type"],
        #             is_active=entity_consent["is_active"],
        #             newsletter_id=entity_consent.get("newsletter_id"),
        #         )
        #         for entity_consent in validated_data["consents"]
        #     ],
        #     module=self.module,
        # )

        return Response(status=201)
