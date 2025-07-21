from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.rest.serializers.legal import TeamSerializer
from comunicat.rest.serializers.user import UserExtraSlimSerializer
from comunicat.rest.utils.fields import IntEnumField
from event.enums import RegistrationStatus
from event.models import (
    Event,
    Location,
    Registration,
    AgendaItem,
    Connection,
    EventModule,
)


class ConnectionSerializer(s.ModelSerializer):
    class Meta:
        model = Connection
        fields = (
            "id",
            "name",
            "type",
            "coordinate_lat",
            "coordinate_lon",
        )
        read_only_fields = (
            "id",
            "name",
            "type",
            "coordinate_lat",
            "coordinate_lon",
        )


class LocationSerializer(s.ModelSerializer):
    description = s.SerializerMethodField(read_only=True)
    connections = ConnectionSerializer(many=True, read_only=True)

    class Meta:
        model = Location
        fields = (
            "id",
            "name",
            "address",
            "description",
            "connections",
            "coordinate_lat",
            "coordinate_lon",
            "created_at",
        )
        read_only_fields = (
            "id",
            "name",
            "address",
            "description",
            "connections",
            "coordinate_lat",
            "coordinate_lon",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_description(self, obj):
        return obj.description.get(translation.get_language())


class RegistrationSlimSerializer(s.ModelSerializer):
    user = UserExtraSlimSerializer(read_only=True)

    class Meta:
        model = Registration
        fields = (
            "id",
            "user",
            "status",
            "created_at",
        )
        read_only_fields = (
            "id",
            "user",
            "status",
            "created_at",
        )


class AgendaItemSerializer(s.ModelSerializer):
    class Meta:
        model = AgendaItem
        fields = (
            "id",
            "name",
            "description",
            "time_from",
            "time_to",
        )
        read_only_fields = (
            "id",
            "name",
            "description",
            "time_from",
            "time_to",
        )


class EventModuleSerializer(s.ModelSerializer):
    team = TeamSerializer(read_only=True)

    class Meta:
        model = EventModule
        fields = (
            "id",
            "module",
            "team",
            "require_signup",
            "require_approve",
        )
        read_only_fields = (
            "id",
            "module",
            "team",
            "require_signup",
            "require_approve",
        )


class EventSerializer(s.ModelSerializer):
    location = LocationSerializer(read_only=True)
    require_signup = s.BooleanField(read_only=True)
    require_approve = s.BooleanField(read_only=True)
    registrations = RegistrationSlimSerializer(many=True, read_only=True)
    modules = EventModuleSerializer(many=True, read_only=True)
    agenda_items = AgendaItemSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "time_from",
            "time_to",
            "location",
            "type",
            "module",
            "require_signup",
            "require_approve",
            "registrations",
            "modules",
            "agenda_items",
            "created_at",
        )
        read_only_fields = (
            "id",
            "title",
            "time_from",
            "time_to",
            "type",
            "module",
            "require_signup",
            "require_approve",
            "registrations",
            "modules",
            "agenda_items",
            "created_at",
        )


class RegistrationItemCountsSerializer(s.Serializer):
    total = s.IntegerField(read_only=True)
    active = s.IntegerField(read_only=True)
    cancelled = s.IntegerField(read_only=True)


class RegistrationCountsSerializer(s.Serializer):
    adults = RegistrationItemCountsSerializer(read_only=True)
    children = RegistrationItemCountsSerializer(read_only=True)


class EventWithCountsSerializer(EventSerializer):
    registration_counts = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "time_from",
            "time_to",
            "location",
            "type",
            "module",
            "require_signup",
            "require_approve",
            "registrations",
            "modules",
            "registration_counts",
            "agenda_items",
            "created_at",
        )
        read_only_fields = (
            "id",
            "title",
            "time_from",
            "time_to",
            "type",
            "module",
            "require_signup",
            "require_approve",
            "registrations",
            "modules",
            "registration_counts",
            "agenda_items",
            "created_at",
        )

    @swagger_serializer_method(
        serializer_or_field=RegistrationCountsSerializer(read_only=True)
    )
    def get_registration_counts(self, obj):
        return {
            "adults": {
                "total": max(
                    obj.registration_count_total,
                    obj.registration_count_active + obj.registration_count_cancelled,
                ),
                "active": obj.registration_count_active,
                "cancelled": obj.registration_count_cancelled,
            },
            "children": {
                "total": max(
                    obj.registration_count_children_total,
                    obj.registration_count_children_active
                    + obj.registration_count_children_cancelled,
                ),
                "active": obj.registration_count_children_active,
                "cancelled": obj.registration_count_children_cancelled,
            },
        }


class CreateRegistrationSerializer(s.Serializer):
    user_id = s.UUIDField(required=True)
    event_id = s.UUIDField(required=True)
    status = IntEnumField(RegistrationStatus, required=False)
    token = s.CharField(required=False)


class RegistrationSerializer(RegistrationSlimSerializer):
    event = EventSerializer(read_only=True)
    user = UserExtraSlimSerializer(read_only=True)

    class Meta:
        model = Registration
        fields = (
            "id",
            "event",
            "user",
            "status",
            "created_at",
        )
        read_only_fields = (
            "id",
            "event",
            "user",
            "status",
            "created_at",
        )


class ListEventCalendarSerializer(s.Serializer):
    month = s.IntegerField(min_value=1, max_value=12, required=False)
    year = s.IntegerField(min_value=1950, max_value=2100, required=False)
    date_from = s.DateField(required=False)
    date_to = s.DateField(required=False)


class ListEventSerializer(s.Serializer):
    date_from = s.DateField(required=False)
    date_to = s.DateField(required=False)
    with_counts = s.BooleanField(required=False)
    token = s.CharField(required=False)


class DestroyRegistrationSerializer(s.Serializer):
    token = s.CharField(required=False)


class ListRegistrationSerializer(s.Serializer):
    event_id = s.UUIDField(required=True)
    for_admin = s.BooleanField(required=False)
