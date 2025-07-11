from rest_framework import serializers as s

from comunicat.rest.utils.fields import MoneyField
from payment.models import (
    PaymentLine,
    Payment,
    PaymentLog,
    Transaction,
    # PaymentReceipt,
    Receipt,
    Expense,
    ExpenseLog,
)


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


class ReceiptSerializer(s.ModelSerializer):
    amount = MoneyField(read_only=True)

    class Meta:
        model = Receipt
        fields = (
            "id",
            "description",
            "date",
            "type",
            "status",
            "amount",
            "vat",
            "file",
            "created_at",
        )
        read_only_fields = (
            "id",
            "description",
            "date",
            "type",
            "status",
            "amount",
            "vat",
            "file",
            "created_at",
        )


# class PaymentReceiptSerializer(s.ModelSerializer):
#     receipt = ReceiptSerializer(read_only=True)
#
#     class Meta:
#         model = PaymentReceipt
#         fields = (
#             "id",
#             "receipt",
#             "amount",
#             "created_at",
#         )
#         read_only_fields = (
#             "id",
#             "receipt",
#             "amount",
#             "created_at",
#         )


class PaymentLineSerializer(s.ModelSerializer):
    amount = MoneyField(read_only=True)
    description = s.CharField(read_only=True)
    receipt = ReceiptSerializer(read_only=True)

    class Meta:
        model = PaymentLine
        fields = (
            "id",
            "description",
            "receipt",
            "amount",
            "vat",
        )
        read_only_fields = (
            "id",
            "description",
            "receipt",
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
    # receipts = PaymentReceiptSerializer(many=True, read_only=True)
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
            # "receipts",
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
            # "receipts",
            "logs",
            "created_at",
        )


class ExpenseLogSerializer(s.ModelSerializer):
    class Meta:
        model = ExpenseLog
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


class ExpenseSerializer(s.ModelSerializer):
    amount = MoneyField(read_only=True)
    description = s.CharField(read_only=True)
    receipts = ReceiptSerializer(many=True, read_only=True)
    logs = ExpenseLogSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = (
            "id",
            "status",
            "amount",
            "description",
            "file",
            "receipts",
            "logs",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "amount",
            "description",
            "file",
            "receipts",
            "logs",
            "created_at",
        )
