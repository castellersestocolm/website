from rest_framework import serializers as s

from comunicat.enums import Module
from comunicat.rest.utils.fields import IntEnumField


class IntegrationGoogleWalletPassLoyaltySerializer(s.Serializer):
    url = s.CharField(read_only=True)


class IntegrationGoogleWalletPassEventSerializer(s.Serializer):
    url = s.CharField(read_only=True)


class IntegrationAppleWalletPassLoyaltyRequestSerializer(s.Serializer):
    token = s.CharField(required=False)
    module = IntEnumField(Module, required=False)
