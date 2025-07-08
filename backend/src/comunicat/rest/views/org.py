from dataclasses import asdict

from django.conf import settings
from django.db import transaction
from django.utils import translation
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer
from rest_framework.response import Response

from django.utils.translation import gettext_lazy as _

from comunicat.rest.serializers.org import OrgCreateSerializer

import user.api
import user.api.family
import user.api.family_member
import membership.api

from comunicat.rest.viewsets import ComuniCatViewSet
from user.enums import FamilyMemberRole, FamilyMemberStatus


# TODO: This is a temporary API for the casal as they currently lack a new website
class OrgAPI(ComuniCatViewSet):
    permission_classes = (permissions.AllowAny,)
    lookup_field = "id"

    def get_throttles(self):
        if self.action in ("create",):
            self.throttle_scope = f"user.{self.action}"
        return super().get_throttles()

    @swagger_auto_schema(
        request_body=OrgCreateSerializer,
        responses={201: Serializer()},
    )
    def create(self, request):
        serializer = OrgCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        locale = translation.get_language()
        if locale not in [code for code, __ in settings.LANGUAGES]:
            locale = "ca"

        adult_1 = validated_data["adults"][0]
        user_1_obj = user.api.register(
            **adult_1,
            birthday=None,
            password=None,
            consent_pictures=False,
            preferred_language=locale,
            towers=None,
            organisation=None,
            with_membership=False,
            module=self.module,
        )

        from user.models import FamilyMember

        if len(validated_data["adults"]) > 1:
            family_member_obj = (
                FamilyMember.objects.filter(
                    family=user_1_obj.family_member.family,
                    role=FamilyMemberRole.MANAGER,
                )
                .exclude(user=user_1_obj)
                .first()
            )
            adult_2 = validated_data["adults"][1]
            if family_member_obj:
                user_2_obj = family_member_obj.user
                for k, v in adult_2.items():
                    setattr(user_2_obj, k, v)
                user_2_obj.save(update_fields=tuple(adult_2.keys()))
            else:
                user_2_obj = user.api.register(
                    **adult_2,
                    birthday=None,
                    password=None,
                    consent_pictures=False,
                    preferred_language=locale,
                    towers=None,
                    organisation=None,
                    with_membership=False,
                    with_family=False,
                    module=self.module,
                )
                if not hasattr(user_2_obj, "family_member"):
                    FamilyMember.objects.create(
                        user=user_2_obj,
                        family=user_1_obj.family_member.family,
                        role=FamilyMemberRole.MANAGER,
                        status=FamilyMemberStatus.ACTIVE,
                    )

        with transaction.atomic():
            family_member_objs = list(
                FamilyMember.objects.filter(
                    family=user_1_obj.family_member.family, role=FamilyMemberRole.MEMBER
                )
            )
            if family_member_objs and len(family_member_objs) > len(
                validated_data["children"]
            ):
                # TODO: This shouldn't really be made public but here we are
                raise ValidationError(
                    {"general": _("The amount of children you entered is incorrect.")}
                )
            for i, child in enumerate(validated_data["children"]):
                if i < len(family_member_objs):
                    user_i_obj = family_member_objs[i].user
                    for k, v in child.items():
                        setattr(user_i_obj, k, v)
                    user_i_obj.save(update_fields=tuple(child.keys()))
                else:
                    user.api.family_member.create(
                        user_id=user_1_obj.id,
                        **child,
                        consent_pictures=False,
                        towers=None,
                        organisation=None,
                        module=self.module,
                        role=FamilyMemberRole.MEMBER,
                        status=FamilyMemberStatus.ACTIVE,
                    )

        membership.api.create_or_update(user_id=user_1_obj.id, modules=[self.module])

        return Response(status=201)
