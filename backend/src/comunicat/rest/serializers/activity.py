from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from activity.models import (Program, ProgramCourse, ProgramCoursePrice,
                             ProgramCourseRegistration)
from comunicat.rest.serializers.event import EventSlimSerializer
from comunicat.rest.serializers.payment import EntitySuperSlimSerializer
from comunicat.rest.utils.fields import MoneyField


class ProgramCoursePriceForProgramCourseSerializer(s.ModelSerializer):
    amount = MoneyField(read_only=True)

    class Meta:
        model = ProgramCoursePrice
        fields = (
            "id",
            "age_from",
            "age_to",
            "min_registrations",
            "amount",
        )
        read_only_fields = (
            "id",
            "age_from",
            "age_to",
            "min_registrations",
            "amount",
        )


class ProgramCourseForProgramSerializer(s.ModelSerializer):
    prices = ProgramCoursePriceForProgramCourseSerializer(read_only=True, many=True)
    events = EventSlimSerializer(read_only=True, many=True)

    class Meta:
        model = ProgramCourse
        fields = (
            "id",
            "date_from",
            "date_to",
            "signup_until",
            "prices",
            "events",
        )
        read_only_fields = (
            "id",
            "date_from",
            "date_to",
            "signup_until",
            "prices",
            "events",
        )


class ProgramSlimSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Program
        fields = (
            "id",
            "name",
        )
        read_only_fields = (
            "id",
            "name",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        if hasattr(obj, "name_locale"):
            return obj.name_locale
        return obj.name.get(translation.get_language())


class ProgramSerializer(ProgramSlimSerializer):
    courses = ProgramCourseForProgramSerializer(read_only=True, many=True)

    class Meta:
        model = Program
        fields = (
            "id",
            "name",
            "courses",
        )
        read_only_fields = (
            "id",
            "name",
            "courses",
        )


class ProgramCourseSlimSerializer(s.ModelSerializer):
    program = ProgramSlimSerializer(read_only=True)

    class Meta:
        model = ProgramCourse
        fields = (
            "id",
            "program",
            "date_from",
            "date_to",
            "signup_until",
        )
        read_only_fields = (
            "id",
            "program",
            "date_from",
            "date_to",
            "signup_until",
        )


class ProgramCourseSerializer(ProgramCourseSlimSerializer):
    class Meta:
        model = ProgramCourse
        fields = (
            "id",
            "program",
            "date_from",
            "date_to",
            "signup_until",
        )
        read_only_fields = (
            "id",
            "program",
            "date_from",
            "date_to",
            "signup_until",
        )


class ProgramCourseRegistrationSlimSerializer(s.ModelSerializer):
    course = ProgramCourseSlimSerializer(read_only=True)
    entity = EntitySuperSlimSerializer(read_only=True)
    amount = MoneyField(read_only=True)

    class Meta:
        model = ProgramCourseRegistration
        fields = (
            "id",
            "course",
            "entity",
            "status",
            "amount",
        )
        read_only_fields = (
            "id",
            "course",
            "entity",
            "status",
            "amount",
        )
