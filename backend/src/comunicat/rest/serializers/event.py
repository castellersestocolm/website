from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.rest.serializers.user import UserExtraSlimSerializer
from event.models import Event, Location, Registration, AgendaItem, Connection


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


class EventSerializer(s.ModelSerializer):
    location = LocationSerializer(read_only=True)
    require_signup = s.BooleanField(read_only=True)
    require_approve = s.BooleanField(read_only=True)
    registrations = RegistrationSlimSerializer(many=True, read_only=True)
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
            "agenda_items",
            "created_at",
        )


class CreateRegistrationSerializer(s.Serializer):
    user_id = s.UUIDField(required=True)
    event_id = s.UUIDField(required=True)
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


class ListEventSerializer(s.Serializer):
    token = s.CharField(required=False)


class DestroyRegistrationSerializer(s.Serializer):
    token = s.CharField(required=False)
