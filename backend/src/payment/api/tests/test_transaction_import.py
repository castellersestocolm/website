import pytest
from django.test import TestCase
from djmoney.money import Money

from conftest import NumOperationsMixin
from payment.api.transaction_import import run
from payment.enums import (
    PaymentMethod,
    PaymentStatus,
    PaymentType,
    SourceType,
    TransactionImportStatus,
)
from payment.models import Payment, PaymentLine, Transaction
from payment.tests.factories import (
    EntityFactory,
    PaymentFactory,
    PaymentLineFactory,
    PaymentProviderFactory,
    SourceFactory,
    TransactionFactory,
    TransactionImportFactory,
    TransactionImportLineFactory,
)
from user.tests.factories import UserFactory


@pytest.mark.django_db
class TestRun(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.payment_provider_1_obj = PaymentProviderFactory(method=PaymentMethod.CARD)

        cls.source_1_obj = SourceFactory(
            name="provider-1",
            type=SourceType.BANK,
        )
        cls.source_2_obj = SourceFactory(
            name="provider-2",
            type=SourceType.PROVIDER,
            provider=cls.payment_provider_1_obj,
            source_bank=cls.source_1_obj,
        )

        cls.transaction_import_1_obj = TransactionImportFactory(
            source=cls.source_1_obj,
            status=TransactionImportStatus.CREATED,
        )
        cls.transaction_import_2_obj = TransactionImportFactory(
            source=cls.source_1_obj,
            status=TransactionImportStatus.PROCESSED,
        )

        cls.transaction_import_line_1_obj = TransactionImportLineFactory(
            transaction_import=cls.transaction_import_2_obj,
            row=0,
            amount=Money(200, "SEK"),
            text="LINE-1",
            sender="firstname-1 lastname-1",
        )
        cls.transaction_import_line_2_obj = TransactionImportLineFactory(
            transaction_import=cls.transaction_import_2_obj,
            row=0,
            amount=Money(300, "SEK"),
            text="LINE-2",
            sender="lastname-1, firstname-1",
        )
        cls.transaction_import_line_3_obj = TransactionImportLineFactory(
            transaction_import=cls.transaction_import_2_obj,
            row=0,
            amount=Money(400, "SEK"),
            text="LINE-3",
            sender="firstname-2 lastname-2",
        )

        cls.user_1_obj = UserFactory(firstname="firstname-1", lastname="lastname-1")
        cls.user_2_obj = UserFactory(firstname="firstname-2", lastname="lastname-2")

        cls.entity_1_obj = EntityFactory(user=cls.user_1_obj)
        cls.entity_2_obj = EntityFactory(user=cls.user_2_obj)

        cls.transaction_1_obj = TransactionFactory(
            source=cls.source_2_obj,
            method=cls.transaction_import_line_1_obj.method,
            amount=cls.transaction_import_line_1_obj.amount,
            vat=cls.transaction_import_line_1_obj.vat,
            text=cls.transaction_import_line_1_obj.text,
            sender=cls.transaction_import_line_1_obj.sender,
            reference=cls.transaction_import_line_1_obj.reference,
            external_id=cls.transaction_import_line_1_obj.external_id,
            date_accounting=cls.transaction_import_line_1_obj.date_accounting,
            date_interest=cls.transaction_import_line_1_obj.date_interest,
            import_line=cls.transaction_import_line_1_obj,
        )

        cls.payment_1_obj = PaymentFactory(
            entity=cls.entity_1_obj,
            type=PaymentType.DEBIT,
            status=PaymentStatus.COMPLETED,
            method=PaymentMethod.CARD,
            transaction=cls.transaction_1_obj,
        )

        cls.payment_line_1_obj = PaymentLineFactory(
            payment=cls.payment_1_obj,
            amount=Money(100, "SEK"),
            text="LINE-1-1",
        )
        cls.payment_line_2_obj = PaymentLineFactory(
            payment=cls.payment_1_obj,
            amount=Money(100, "SEK"),
            text="LINE-1-2",
        )

    def test_run__not_processed(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1):
            transaction_import_obj = run(
                transaction_import_id=self.transaction_import_1_obj.id,
            )

        self.assertIsNone(transaction_import_obj)

    def test_run__processed(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=20, num_inserts=6, num_updates=1
        ):
            transaction_import_obj = run(
                transaction_import_id=self.transaction_import_2_obj.id,
            )

        self.assertIsNotNone(transaction_import_obj)

        self.assertEqual(
            transaction_import_obj.status, TransactionImportStatus.COMPLETED
        )

        transaction_count = Transaction.objects.count()
        payment_count = Payment.objects.count()
        payment_line_count = PaymentLine.objects.count()

        self.assertEqual(transaction_count, 3)
        self.assertEqual(payment_count, 3)
        self.assertEqual(payment_line_count, 4)

        transaction_2_obj = Transaction.objects.get(text="LINE-2")
        payment_2_obj = Payment.objects.get(transaction=transaction_2_obj)
        payment_line_2_obj = PaymentLine.objects.get(payment=payment_2_obj)

        self.assertEqual(transaction_2_obj.source, self.source_1_obj)
        self.assertEqual(
            transaction_2_obj.method, self.transaction_import_line_2_obj.method
        )
        self.assertEqual(transaction_2_obj.amount, Money(300, "SEK"))
        self.assertEqual(transaction_2_obj.vat, self.transaction_import_line_2_obj.vat)
        self.assertEqual(transaction_2_obj.text, "LINE-2")
        self.assertEqual(transaction_2_obj.sender, "firstname-1 lastname-1")
        self.assertEqual(
            transaction_2_obj.reference, self.transaction_import_line_2_obj.reference
        )
        self.assertEqual(
            transaction_2_obj.external_id,
            self.transaction_import_line_2_obj.external_id,
        )
        self.assertEqual(
            transaction_2_obj.date_accounting,
            self.transaction_import_line_2_obj.date_accounting,
        )
        self.assertEqual(
            transaction_2_obj.date_interest,
            self.transaction_import_line_2_obj.date_interest,
        )
        self.assertEqual(transaction_2_obj.importer, self.transaction_import_2_obj)
        self.assertEqual(
            transaction_2_obj.import_line, self.transaction_import_line_2_obj
        )
        self.assertEqual(
            transaction_2_obj.extra, self.transaction_import_line_2_obj.extra
        )

        self.assertEqual(payment_2_obj.entity, self.entity_1_obj)
        self.assertEqual(payment_2_obj.type, PaymentType.DEBIT)
        self.assertEqual(payment_2_obj.status, PaymentStatus.COMPLETED)
        self.assertEqual(payment_2_obj.method, transaction_2_obj.method)
        self.assertEqual(payment_2_obj.text, "LINE-2")
        self.assertEqual(payment_2_obj.transaction, transaction_2_obj)

        self.assertEqual(payment_line_2_obj.payment, payment_2_obj)
        self.assertIsNone(payment_line_2_obj.text)
        self.assertEqual(payment_line_2_obj.amount, Money(300, "SEK"))
        self.assertEqual(payment_line_2_obj.vat, self.transaction_import_line_2_obj.vat)

        transaction_3_obj = Transaction.objects.get(text="LINE-3")
        payment_3_obj = Payment.objects.get(transaction=transaction_3_obj)
        payment_line_3_obj = PaymentLine.objects.get(payment=payment_3_obj)

        self.assertEqual(transaction_3_obj.source, self.source_1_obj)
        self.assertEqual(transaction_3_obj.amount, Money(400, "SEK"))
        self.assertEqual(transaction_3_obj.text, "LINE-3")
        self.assertEqual(transaction_3_obj.sender, "firstname-2 lastname-2")

        self.assertEqual(payment_3_obj.entity, self.entity_2_obj)
        self.assertEqual(payment_3_obj.text, "LINE-3")
        self.assertEqual(payment_3_obj.transaction, transaction_3_obj)

        self.assertEqual(payment_line_3_obj.payment, payment_3_obj)
        self.assertIsNone(payment_line_3_obj.text)
        self.assertEqual(payment_line_3_obj.amount, Money(400, "SEK"))
