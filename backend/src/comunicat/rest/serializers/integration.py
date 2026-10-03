from rest_framework import serializers as s


class IntegrationGoogleWalletPassLoyaltySerializer(s.Serializer):
    url = s.CharField(read_only=True)


class IntegrationGoogleWalletPassEventSerializer(s.Serializer):
    url = s.CharField(read_only=True)


class IntegrationAppleWalletPassLoyaltyRequestSerializer(s.Serializer):
    token = s.CharField(required=False)


class IntegrationAppleWalletPassEventRequestSerializer(s.Serializer):
    token = s.CharField(required=False)


class IntegrationAppleWalletPassLoyaltyRegisterRequestSerializer(s.Serializer):
    pushToken = s.CharField()


class IntegrationAppleWalletPassLoyaltyRegisterRetrieveRequestSerializer(s.Serializer):
    previousLastUpdated = s.CharField(required=False)


class IntegrationAppleWalletPassLoyaltyRegisterRetrieveSerializer(s.Serializer):
    serialNumbers = s.ListSerializer(child=s.CharField())
    lastUpdated = s.CharField()
