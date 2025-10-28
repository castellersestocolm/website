from django.templatetags.i18n import language
from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from legal.models import Team, Member, Role, Bylaws
from user.models import User

from django.conf import settings


class MemberUserSerializer(s.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "firstname",
            "lastname",
        )
        read_only_fields = (
            "firstname",
            "lastname",
        )


class RoleSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    name_plural = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "name_plural",
            "order",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "name_plural",
            "order",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name_plural(self, obj):
        return obj.name_plural.get(translation.get_language()) or obj.name.get(
            translation.get_language()
        )


class MemberSerializer(s.ModelSerializer):
    user = MemberUserSerializer(read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = Member
        fields = (
            "id",
            "user",
            "role",
            "picture",
            "created_at",
        )
        read_only_fields = (
            "id",
            "user",
            "role",
            "picture",
            "created_at",
        )


class TeamSlimSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Team
        fields = (
            "id",
            "name",
            "type",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "type",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())


class TeamSerializer(TeamSlimSerializer):
    members = MemberSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = (
            "id",
            "name",
            "type",
            "date_from",
            "date_to",
            "members",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "type",
            "date_from",
            "date_to",
            "members",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())


class MemberWithTeamSerializer(MemberSerializer):
    team = TeamSlimSerializer(read_only=True)

    class Meta:
        model = Member
        fields = (
            "id",
            "user",
            "team",
            "role",
            "picture",
            "created_at",
        )
        read_only_fields = (
            "id",
            "user",
            "team",
            "role",
            "picture",
            "created_at",
        )


class BylawsSerializer(s.ModelSerializer):
    content = s.SerializerMethodField(read_only=True)
    language = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Bylaws
        fields = (
            "id",
            "date",
            "content",
            "language",
            "created_at",
        )
        read_only_fields = (
            "id",
            "date",
            "content",
            "language",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_content(self, obj):
        locale = translation.get_language()
        return (
            [
                obj.content[locale_fallback]
                for locale_fallback in [locale]
                + settings.LANGUAGES_FALLBACK.get(locale, [])
                if locale_fallback in obj.content and obj.content[locale_fallback]
            ]
            + [""]
        )[0]

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_language(self, obj):
        locale = translation.get_language()
        return (
            [
                locale_fallback
                for locale_fallback in [locale]
                + settings.LANGUAGES_FALLBACK.get(locale, [])
                if locale_fallback in obj.content and obj.content[locale_fallback]
            ]
            + [locale]
        )[0]
