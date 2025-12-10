from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.rest.utils.fields import IntEnumField
from towers.enums import PositionType


class TowerSerializer(s.Serializer):
    name = s.CharField(read_only=True)
    order = s.IntegerField(read_only=True)
    is_published = s.BooleanField(read_only=True)

    external_id = s.IntegerField(read_only=True)


class TowerUserSerializer(s.Serializer):
    id = s.UUIDField(read_only=True)


class PositionSerializer(s.Serializer):
    type = IntEnumField(enum=PositionType, read_only=True)

    external_id = s.IntegerField(read_only=True)


class PlaceSerializer(s.Serializer):
    user = s.SerializerMethodField(read_only=True)
    position = PositionSerializer(read_only=True)

    external_id = s.IntegerField(read_only=True)

    @swagger_serializer_method(serializer_or_field=TowerUserSerializer(read_only=True))
    def get_user(self, obj):
        return TowerUserSerializer({"id": obj.user_id}).data


class TowerWithPlacesSerializer(TowerSerializer):
    places = PlaceSerializer(read_only=True, many=True)

    external_id = s.IntegerField(read_only=True)


class ListTowerSerializer(s.Serializer):
    event_id = s.UUIDField()
