from rest_framework import serializers as s

from comunicat.rest.utils.fields import MoneyField
from payment.models import PaymentLine, Payment, PaymentLog, Transaction


class PaymentLogSerializer(s.ModelSerializer):
    class Meta:
        model = PaymentLog
        fields = (
            "id",
            "status",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "created_at",
        )


class PaymentLineSerializer(s.ModelSerializer):
    amount = MoneyField(read_only=True)
    description = s.CharField(read_only=True)

    class Meta:
        model = PaymentLine
        fields = (
            "id",
            "description",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "description",
            "amount",
            "vat",
        )


class TransactionSerializer(s.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            "id",
            "method",
            "date_accounting",
        )
        read_only_fields = (
            "id",
            "method",
            "date_accounting",
        )


class PaymentSerializer(s.ModelSerializer):
    amount = MoneyField(read_only=True)
    description = s.CharField(read_only=True)
    transaction = TransactionSerializer(read_only=True, required=False)
    lines = PaymentLineSerializer(many=True, read_only=True)
    logs = PaymentLogSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "type",
            "status",
            "method",
            "amount",
            "description",
            "transaction",
            "lines",
            "logs",
            "created_at",
        )
        read_only_fields = (
            "id",
            "type",
            "status",
            "method",
            "amount",
            "description",
            "transaction",
            "lines",
            "logs",
            "created_at",
        )
