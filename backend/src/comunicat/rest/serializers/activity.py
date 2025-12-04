from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from activity.models import Program, ProgramCourse, ProgramCoursePrice
from comunicat.rest.serializers.event import EventSlimSerializer
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


class ProgramSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
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

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        if hasattr(obj, "name_locale"):
            return obj.name_locale
        return obj.name.get(translation.get_language())
