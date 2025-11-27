from django.conf import settings
from django.utils import translation
from drf_yasg.utils import swagger_serializer_method
from paypalserversdk.configuration import Environment
from phonenumber_field.formfields import PhoneNumberField
from rest_framework import serializers as s
from rest_framework.exceptions import ValidationError
from versatileimagefield.serializers import VersatileImageFieldSerializer

from comunicat.rest.utils.fields import MoneyField
from payment.enums import PaymentStatus
from payment.models import (
    PaymentLine,
    Payment,
    PaymentLog,
    Transaction,
    Receipt,
    Expense,
    ExpenseLog,
    PaymentProvider,
    PaymentOrder,
    Entity,
)
from django.utils.translation import gettext_lazy as _


class CreateEntitySerializer(s.Serializer):
    firstname = s.CharField(allow_null=True)
    lastname = s.CharField(allow_null=True)
    email = s.EmailField()
    phone = PhoneNumberField(empty_value=True)

    def validate_firstname(self, value: str | None):
        user_obj = self.context.get("user")

        if not user_obj and not value:
            raise ValidationError(
                {"firstname": _("The first name is required for non-logged in users.")}
            )

        return value

    def validate_lastname(self, value: str | None):
        user_obj = self.context.get("user")

        if not user_obj and not value:
            raise ValidationError(
                {"lastname": _("The last name is required for non-logged in users.")}
            )

        return value


class EntitySlimSerializer(s.ModelSerializer):
    firstname = s.SerializerMethodField(read_only=True)
    lastname = s.SerializerMethodField(read_only=True)
    email = s.SerializerMethodField(read_only=True)

    class Meta:
        model = Entity
        fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "created_at",
        )
        read_only_fields = (
            "id",
            "firstname",
            "lastname",
            "email",
            "created_at",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_firstname(self, obj):
        return obj.user.firstname if obj.user else obj.firstname

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_lastname(self, obj):
        return obj.user.lastname if obj.user else obj.lastname

    @swagger_serializer_method(serializer_or_field=s.EmailField(read_only=True))
    def get_email(self, obj):
        return obj.user.email if obj.user else obj.email


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


class PaymentProviderSerializer(s.ModelSerializer):
    name = s.SerializerMethodField(read_only=True)
    picture = VersatileImageFieldSerializer(
        allow_null=True,
        sizes=[
            ("large", "url"),
            # TODO: Fix this
            ("medium", "url"),
            ("small", "url"),
            # ("medium", "thumbnail__500x500"),
            # ("small", "thumbnail__100x100")
        ],
        read_only=True,
    )

    class Meta:
        model = PaymentProvider
        fields = (
            "id",
            "name",
            "code",
            "picture",
            "method",
            "order",
            "is_enabled",
        )
        read_only_fields = (
            "id",
            "name",
            "code",
            "picture",
            "method",
            "order",
            "is_enabled",
        )

    @swagger_serializer_method(serializer_or_field=s.CharField(read_only=True))
    def get_name(self, obj):
        return obj.name.get(translation.get_language())


class PaymentOrderSerializer(s.ModelSerializer):
    provider = PaymentProviderSerializer(read_only=True)
    fulfillment = s.SerializerMethodField(read_only=True)

    class Meta:
        model = PaymentOrder
        fields = (
            "id",
            "provider",
            "status",
            "external_id",
            "fulfillment",
        )
        read_only_fields = (
            "id",
            "provider",
            "status",
            "external_id",
            "fulfillment",
        )

    @swagger_serializer_method(serializer_or_field=s.DictField(read_only=True))
    def get_fulfillment(self, obj):
        if obj.status == PaymentStatus.PENDING:
            if obj.provider.code == "PAYPAL" and obj.external_id:
                return {
                    "url": f"https://www{'.sandbox' if Environment[settings.PAYMENT_PROVIDER_PAYPAL_ENVIRONMENT] == Environment.SANDBOX else ''}.paypal.com/checkoutnow?token={obj.external_id}"
                }
        return {}
