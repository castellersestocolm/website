from rest_framework import serializers as s


class CastleSerializer(s.Serializer):
    name = s.CharField(read_only=True)
    order = s.IntegerField(read_only=True)

    external_id = s.IntegerField(read_only=True)


class ListCastleSerializer(s.Serializer):
    event_id = s.UUIDField()
