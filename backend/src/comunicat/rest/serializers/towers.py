from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers as s

from comunicat.rest.utils.fields import IntEnumField
from towers.enums import PositionType


class TowerSerializer(s.Serializer):
    name = s.CharField(read_only=True)
    order = s.IntegerField(read_only=True)
    is_published = s.BooleanField(read_only=True)

    external_id = s.IntegerField(read_only=True)


class TowerUserSlimSerializer(s.Serializer):
    id = s.UUIDField(read_only=True)


class TowerUserTowersSerializer(s.Serializer):
    alias = s.CharField(required=False, read_only=True)


class TowerUserAliasSerializer(s.Serializer):
    towers = TowerUserTowersSerializer(required=False, read_only=True)


class PositionSerializer(s.Serializer):
    type = IntEnumField(enum=PositionType, read_only=True)

    external_id = s.IntegerField(read_only=True)


class PlacementSerializer(s.Serializer):
    x = s.IntegerField(read_only=True)
    y = s.IntegerField(read_only=True)
    angle = s.IntegerField(read_only=True)


class SizeSerializer(s.Serializer):
    width = s.IntegerField(read_only=True)
    height = s.IntegerField(read_only=True)


class PlaceExtraSerializer(s.Serializer):
    text = s.CharField(required=False, read_only=True)
    height = s.IntegerField(required=False, read_only=True)


class PlaceSlimSerializer(s.Serializer):
    position = PositionSerializer(read_only=True)
    placement = PlacementSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    extra = PlaceExtraSerializer(read_only=True)

    layer = s.IntegerField(read_only=True)
    ring = s.IntegerField(read_only=True)

    external_id = s.IntegerField(read_only=True)
    external_next_id = s.IntegerField(required=False, read_only=True)
    external_link_id = s.IntegerField(required=False, read_only=True)


class PlaceSerializer(PlaceSlimSerializer):
    user = TowerUserSlimSerializer(read_only=True)


class PlaceWithUserAliasSerializer(PlaceSlimSerializer):
    user = TowerUserAliasSerializer(read_only=True)
    is_user = s.BooleanField(read_only=True)
    is_family = s.BooleanField(read_only=True)


class TowerWithPlacesSerializer(TowerSerializer):
    places = PlaceSerializer(read_only=True, many=True)

    external_id = s.IntegerField(read_only=True)


class TowerWithPlacesAliasSerializer(TowerSerializer):
    places = PlaceWithUserAliasSerializer(read_only=True, many=True)

    external_id = s.IntegerField(read_only=True)


class ListTowerSerializer(s.Serializer):
    event_id = s.UUIDField()
