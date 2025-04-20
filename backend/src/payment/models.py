import os

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from djmoney.models.fields import MoneyField

from comunicat.consts import CODE_NAME_BY_MODULE
from comunicat.db.mixins import StandardModel, Timestamps
from django.db import models

from comunicat.enums import Module
from comunicat.storage import signed_storage
from payment.enums import (
    PaymentType,
    PaymentMethod,
    PaymentStatus,
    SourceType,
    AccountCategory,
    TransactionImportStatus,
    ReceiptStatus,
    ReceiptType,
    ExpenseStatus,
)
from payment.managers import (
    PaymentQuerySet,
    PaymentLineQuerySet,
    AccountQuerySet,
    ExpenseQuerySet,
)

from django.utils.translation import gettext_lazy as _


class Payment(StandardModel, Timestamps):
    entity = models.ForeignKey(
        "Entity",
        null=True,
        blank=True,
        related_name="payments",
        on_delete=models.CASCADE,
    )
    type = models.PositiveSmallIntegerField(
        choices=((pt.value, pt.name) for pt in PaymentType),
        default=PaymentType.DEBIT,
    )
    status = models.PositiveSmallIntegerField(
        choices=((ps.value, ps.name) for ps in PaymentStatus),
        default=PaymentStatus.PENDING,
    )
    method = models.PositiveIntegerField(
        choices=((pm.value, pm.name) for pm in PaymentMethod),
        null=True,
        blank=True,
    )

    text = models.CharField(max_length=255, null=True, blank=True)

    transaction = models.ForeignKey(
        "Transaction",
        related_name="payments",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    debit_payment = models.ForeignKey(
        "Payment",
        null=True,
        blank=True,
        related_name="credit_payments",
        on_delete=models.CASCADE,
    )

    objects = PaymentQuerySet.as_manager()

    __status = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__status = self.status

    def __str__(self) -> str:
        extra_str = ""
        if self.entity:
            extra_str += f" - {self.entity}"
        if self.text:
            extra_str += f" - {self.text}"
        return f"{PaymentMethod(self.method).name if self.method else ''}{extra_str}"

    def save(self, *args, **kwargs):
        if self.pk and self.status != self.__status:
            PaymentLog.objects.create(payment_id=self.id, status=self.status)
        super().save(*args, **kwargs)


class Entity(StandardModel, Timestamps):
    firstname = models.CharField(max_length=255, null=True, blank=True)
    lastname = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)

    user = models.OneToOneField(
        "user.User", null=True, blank=True, on_delete=models.CASCADE
    )

    @property
    def full_name(self) -> str:
        if self.firstname:
            if self.lastname:
                return f"{self.firstname} {self.lastname}"
            return self.firstname
        return _("Unknown")

    def __str__(self) -> str:
        end_str = f"<{self.email}>" if self.email else ""
        if self.user:
            return str(self.user)
        if self.firstname:
            if self.lastname:
                return f"{self.firstname} {self.lastname}{end_str}"
            return f"{self.firstname}{end_str}"
        return self.email or self.id

    class Meta:
        verbose_name = "entity"
        verbose_name_plural = "entities"


def get_expense_file_name(instance, filename):
    return os.path.join(
        "payment/expense/file/", str(instance.id) + "." + filename.split(".")[-1]
    )


# TODO: Add "where to be paid" like bank account
class Expense(StandardModel, Timestamps):
    entity = models.ForeignKey(
        Entity, related_name="expenses", on_delete=models.CASCADE
    )

    status = models.PositiveSmallIntegerField(
        choices=((es.value, es.name) for es in ExpenseStatus),
        default=ExpenseStatus.CREATED,
    )

    file = models.FileField(
        upload_to=get_expense_file_name,
        null=True,
        blank=True,
        storage=signed_storage,
        validators=[FileExtensionValidator(["pdf", "png", "jpg", "jpeg"])],
    )

    objects = ExpenseQuerySet.as_manager()

    __status = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__status = self.status

    def save(self, *args, **kwargs):
        if self.pk and self.status != self.__status:
            ExpenseLog.objects.create(expense_id=self.id, status=self.status)
        super().save(*args, **kwargs)


class ExpenseLog(StandardModel, Timestamps):
    expense = models.ForeignKey(
        "Expense", related_name="logs", on_delete=models.CASCADE
    )
    status = models.PositiveSmallIntegerField(
        choices=((es.value, es.name) for es in ExpenseStatus),
    )


def get_receipt_file_name(instance, filename):
    return os.path.join(
        "payment/receipt/file/", str(instance.id) + "." + filename.split(".")[-1]
    )


class Receipt(StandardModel, Timestamps):
    description = models.CharField(max_length=255)
    date = models.DateField()

    type = models.PositiveSmallIntegerField(
        choices=((rt.value, rt.name) for rt in ReceiptType),
        default=ReceiptType.PERSONAL,
    )
    status = models.PositiveSmallIntegerField(
        choices=((rs.value, rs.name) for rs in ReceiptStatus),
        default=ReceiptStatus.CREATED,
    )

    amount = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    vat = models.PositiveSmallIntegerField(default=0)

    expense = models.ForeignKey(
        Expense,
        blank=True,
        null=True,
        related_name="receipts",
        on_delete=models.CASCADE,
    )

    file = models.FileField(
        upload_to=get_receipt_file_name,
        storage=signed_storage,
        validators=[FileExtensionValidator(["pdf", "png", "jpg", "jpeg"])],
    )

    def __str__(self) -> str:
        return self.file.name


class PaymentLine(StandardModel, Timestamps):
    payment = models.ForeignKey(
        "Payment", related_name="lines", on_delete=models.CASCADE
    )

    text = models.CharField(max_length=255, null=True, blank=True)

    amount = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    vat = models.PositiveSmallIntegerField(default=0)

    item_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    item_id = models.CharField(max_length=255, null=True, blank=True)
    item = GenericForeignKey("item_type", "item_id")

    account = models.ForeignKey(
        "Account",
        related_name="payment_lines",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    debit_line = models.ForeignKey(
        "PaymentLine",
        null=True,
        blank=True,
        related_name="credit_lines",
        on_delete=models.CASCADE,
    )

    receipt = models.ForeignKey(
        Receipt,
        related_name="payment_lines",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    objects = PaymentLineQuerySet.as_manager()

    def __str__(self) -> str:
        extra_str = ""
        if self.payment.entity:
            extra_str += f" - {self.payment.entity}"
        if self.text or self.payment.text:
            extra_str += f" - {self.text or self.payment.text}"
        return f"{PaymentMethod(self.payment.method).name + ' - ' if self.payment.method else ''}{self.amount}{extra_str}"


class PaymentLog(StandardModel, Timestamps):
    payment = models.ForeignKey(
        "Payment", related_name="logs", on_delete=models.CASCADE
    )
    status = models.PositiveSmallIntegerField(
        choices=((ps.value, ps.name) for ps in PaymentStatus),
    )


class Account(StandardModel, Timestamps):
    name = models.CharField(max_length=255)
    code = models.PositiveSmallIntegerField(unique=True)

    type = models.PositiveSmallIntegerField(
        choices=((pt.value, pt.name) for pt in PaymentType),
        null=True,
        blank=True,
    )

    category = models.PositiveSmallIntegerField(
        choices=((ac.value, ac.name) for ac in AccountCategory), null=True, blank=True
    )

    module = models.PositiveSmallIntegerField(
        choices=((m.value, m.name) for m in Module), null=True, blank=True
    )

    allow_transactions = models.BooleanField(default=True)
    parent = models.ForeignKey(
        "Account",
        null=True,
        blank=True,
        related_name="subaccounts",
        on_delete=models.CASCADE,
    )

    objects = AccountQuerySet.as_manager()

    __type = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__type = self.type

    @property
    def full_name(self) -> str:
        if self.parent:
            return f"{self.parent.name} - {self.name}"
        return self.name

    def __str__(self) -> str:
        extra_end = ""
        if self.module:
            extra_end = f" ({CODE_NAME_BY_MODULE[self.module]})"
        return f"{self.code} - {self.full_name}{extra_end}"

    def clean(self):
        if self.parent and not self.category:
            raise ValidationError(
                {"category": _("Category must be set for accounts with parent.")}
            )

    def save(self, *args, **kwargs):
        if self.type != self.__type:
            self.subaccounts.update(type=self.type)
        super().save(*args, **kwargs)


class AccountTag(StandardModel, Timestamps):
    account = models.ForeignKey(
        "Account", related_name="tags", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return f"{str(self.account)} - {self.name}"


class Source(StandardModel, Timestamps):
    name = models.CharField(max_length=255, unique=True)
    type = models.PositiveSmallIntegerField(
        choices=((st.value, st.name) for st in SourceType),
        default=SourceType.BANK,
    )

    def __str__(self) -> str:
        return self.name


class Transaction(StandardModel, Timestamps):
    source = models.ForeignKey(
        "Source",
        null=True,
        blank=True,
        related_name="transactions",
        on_delete=models.CASCADE,
    )

    method = models.PositiveIntegerField(
        choices=((pm.value, pm.name) for pm in PaymentMethod),
        default=PaymentMethod.TRANSFER,
    )

    amount = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    vat = models.PositiveSmallIntegerField(default=0)

    text = models.CharField(max_length=255, null=True, blank=True)
    sender = models.CharField(max_length=255, null=True, blank=True)
    reference = models.CharField(max_length=255, null=True, blank=True)

    external_id = models.CharField(max_length=255, null=True, blank=True)

    date_accounting = models.DateField()
    date_interest = models.DateField(null=True, blank=True)

    importer = models.ForeignKey(
        "TransactionImport",
        null=True,
        blank=True,
        related_name="transactions",
        on_delete=models.CASCADE,
    )

    # For storing extra data such as telephone numbers for SE_SWISH
    extra = models.JSONField(default=dict)

    def __str__(self):
        extra_str = ""
        if self.sender:
            extra_str += f" - {self.sender}"
        if self.text:
            extra_str += f" - {self.text}"
        return f"{self.source} - {self.method} - {self.amount}{extra_str}"


def get_transaction_import_file_name(instance, filename):
    return os.path.join(
        "payment/transactionimport/file/",
        str(instance.id) + "." + filename.split(".")[-1],
    )


class TransactionImport(StandardModel, Timestamps):
    source = models.ForeignKey(
        "Source", related_name="transaction_imports", on_delete=models.CASCADE
    )

    date_from = models.DateField()
    date_to = models.DateField()

    status = models.PositiveSmallIntegerField(
        choices=((tis.value, tis.name) for tis in TransactionImportStatus),
        default=TransactionImportStatus.CREATED,
    )

    file = models.FileField(
        upload_to=get_transaction_import_file_name,
        null=True,
        blank=True,
        storage=signed_storage,
        validators=[FileExtensionValidator(["csv"])],
    )
    input = models.TextField(max_length=10000, null=True, blank=True)

    def save(self, run: bool = True, *args, **kwargs):
        super().save(*args, **kwargs)

        if run:
            import payment.api.importer

            payment.api.importer.run(transaction_import_id=self.id)


def get_statement_file_name(instance, filename):
    return os.path.join(
        "payment/statement/file/",
        str(instance.id) + "." + filename.split(".")[-1],
    )


class Statement(StandardModel, Timestamps):
    source = models.ForeignKey(
        "Source", related_name="statements", on_delete=models.CASCADE
    )

    date_from = models.DateField()
    date_to = models.DateField()

    amount_start = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )
    amount_end = MoneyField(
        max_digits=7,
        decimal_places=2,
        default_currency="SEK",
    )

    file = models.FileField(
        upload_to=get_statement_file_name,
        storage=signed_storage,
        validators=[FileExtensionValidator(["pdf"])],
    )
