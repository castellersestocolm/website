from rest_framework import serializers as s


class IntegrationGoogleWalletPassLoyaltySerializer(s.Serializer):
    url = s.CharField(read_only=True)


class IntegrationGoogleWalletPassEventSerializer(s.Serializer):
    url = s.CharField(read_only=True)


class IntegrationAppleWalletPassLoyaltyRequestSerializer(s.Serializer):
    token = s.CharField(required=False)
