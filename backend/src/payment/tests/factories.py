import random
from uuid import uuid4

from django.utils import timezone
from djmoney.money import Money
from factory import (
    Faker,
    LazyAttribute,
    LazyFunction,
    SelfAttribute,
    Sequence,
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_string
from payment.enums import (
    AccountCategory,
    ExpenseStatus,
    PaymentMethod,
    PaymentStatus,
    PaymentType,
    ReceiptStatus,
    ReceiptType,
    SourceType,
    TransactionImportStatus,
)
from payment.models import (
    Account,
    Entity,
    Expense,
    Payment,
    PaymentLine,
    PaymentProvider,
    Receipt,
    Source,
    Transaction,
    TransactionImport,
)


class EntityFactory(DjangoModelFactory):
    email = SelfAttribute("user.email")
    firstname = SelfAttribute("user.firstname")
    lastname = SelfAttribute("user.lastname")
    phone = SelfAttribute("user.phone")

    user = SubFactory("user.tests.factories.UserFactory")

    class Meta:
        model = Entity


class PaymentProviderFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = LazyFunction(fake_string)

    method = FuzzyChoice(PaymentMethod)

    order = Sequence(lambda n: n)

    is_enabled = True
    is_visible = True

    class Meta:
        model = PaymentProvider


class SourceFactory(DjangoModelFactory):
    name = Faker("name")

    # TODO: Factory random provider depending on type
    type = SourceType.BANK
    provider = None
    source_bank = None

    class Meta:
        model = Source


class TransactionImportFactory(DjangoModelFactory):
    source = SubFactory(SourceFactory)

    date_from = LazyFunction(lambda: timezone.localdate())
    date_to = SelfAttribute("date_from")

    status = FuzzyChoice(TransactionImportStatus)

    input = ""

    class Meta:
        model = TransactionImport


class TransactionFactory(DjangoModelFactory):
    source = SubFactory(SourceFactory)

    method = FuzzyChoice(PaymentMethod)

    amount = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))
    vat = 0

    text = Faker("sentence")
    sender = Faker("sentence")
    reference = LazyFunction(lambda: fake_string(length=8).upper())

    external_id = LazyFunction(lambda: str(uuid4()))

    date_accounting = LazyFunction(lambda: timezone.localdate())
    date_interest = SelfAttribute("date_accounting")

    importer = SubFactory(TransactionImportFactory)

    class Meta:
        model = Transaction


class PaymentFactory(DjangoModelFactory):
    entity = SubFactory(EntityFactory)

    type = FuzzyChoice(PaymentType)
    status = FuzzyChoice(PaymentStatus)
    method = FuzzyChoice(PaymentMethod)

    text = SelfAttribute("transaction.text")

    transaction = SubFactory(TransactionFactory)

    debit_payment = None

    class Meta:
        model = Payment


class AccountFactory(DjangoModelFactory):
    name = Faker("name")
    code = Sequence(lambda n: n)

    type = FuzzyChoice(PaymentType)

    category = FuzzyChoice(AccountCategory)

    module = FuzzyChoice(Module)

    allow_transactions = True
    parent = None

    class Meta:
        model = Account


class ExpenseFactory(DjangoModelFactory):
    entity = SubFactory(EntityFactory)

    status = FuzzyChoice(ExpenseStatus)

    class Meta:
        model = Expense


class ReceiptFactory(DjangoModelFactory):
    entity = SelfAttribute("expense.entity")

    description = Faker("sentence")
    date = LazyFunction(lambda: timezone.localdate())

    type = FuzzyChoice(ReceiptType)
    status = FuzzyChoice(ReceiptStatus)

    amount = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))
    vat = 0

    expense = SubFactory(ExpenseFactory)

    class Meta:
        model = Receipt


class PaymentLineFactory(DjangoModelFactory):
    payment = SubFactory(PaymentFactory)

    text = Faker("sentence")

    amount = SelfAttribute("payment.transaction.amount")
    vat = SelfAttribute("payment.transaction.vat")

    account = SubFactory(AccountFactory)

    debit_line = None

    receipt = SubFactory(ReceiptFactory)

    class Meta:
        model = PaymentLine
