import pytest
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money

from comunicat.enums import Module
from conftest import NumOperationsMixin
from order.enums import OrderStatus, OrderType
from order.tests.factories import (
    OrderDeliveryFactory,
    OrderFactory,
    OrderMembershipFactory,
    OrderProductFactory,
    OrderRegistrationFactory,
    PaymentOrderFactory,
)
from payment.api import create_for_order
from payment.enums import PaymentMethod, PaymentStatus, PaymentType, SourceType
from payment.models import Payment, PaymentLine, Transaction
from payment.tests.factories import PaymentProviderFactory, SourceFactory


@pytest.mark.django_db
class TestCreateForOrder(NumOperationsMixin, TestCase):
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

        cls.payment_order_1_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_2_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_3_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_4_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )

        cls.order_delivery_1_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))
        cls.order_delivery_2_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))

        cls.order_1_obj = OrderFactory(
            delivery=cls.order_delivery_1_obj,
            payment_order=cls.payment_order_1_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            delivery=cls.order_delivery_2_obj,
            payment_order=cls.payment_order_2_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
        )
        cls.order_3_obj = OrderFactory(
            delivery=None,
            payment_order=cls.payment_order_3_obj,
            type=OrderType.REGISTRATION,
            status=OrderStatus.CREATED,
        )
        cls.order_4_obj = OrderFactory(
            delivery=None,
            payment_order=cls.payment_order_4_obj,
            type=OrderType.MEMBERSHIP,
            status=OrderStatus.CREATED,
        )

        for order_obj in (cls.order_1_obj, cls.order_2_obj):
            OrderProductFactory(
                order=order_obj, quantity=1, amount_unit=Money(200, "SEK")
            )
            OrderProductFactory(
                order=order_obj, quantity=2, amount_unit=Money(50, "SEK")
            )

        OrderRegistrationFactory(order=cls.order_3_obj, amount=Money(300, "SEK"))
        OrderRegistrationFactory(order=cls.order_3_obj, amount=Money(200, "SEK"))

        OrderMembershipFactory(
            order=cls.order_4_obj, module__module=Module.ORG, amount=Money(300, "SEK")
        )
        OrderMembershipFactory(
            order=cls.order_4_obj,
            module__module=Module.TOWERS,
            amount=Money(200, "SEK"),
        )

        cls.order_5_obj = OrderFactory(
            type=OrderType.PRODUCT,
            status=OrderStatus.COMPLETED,
        )

    def test_create_for_order__order_created_captured(self, *args, **kwargs):
        date_accounting = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=23, num_inserts=5, num_updates=4
        ):
            payment_obj = create_for_order(
                order_id=self.order_1_obj.id,
                status=PaymentStatus.PROCESSING,
                date_accounting=date_accounting,
                external_id="external-order-1",
                reference="ORDER-1",
            )

        self.assertEqual(payment_obj.type, PaymentType.DEBIT)
        self.assertEqual(payment_obj.status, PaymentStatus.PROCESSING)

        with self.assertNumOperations(
            num=0, num_selects=22, num_inserts=4, num_updates=7
        ):
            payment_obj = create_for_order(
                order_id=self.order_1_obj.id,
                status=PaymentStatus.COMPLETED,
                date_accounting=date_accounting,
                external_id="external-order-1",
                reference="ORDER-1",
                fee_amount=Money(50, "SEK"),
            )

        self.assertIsNotNone(payment_obj)

        transaction_debit_count = Transaction.objects.filter(
            reference="ORDER-1", amount__gt=0
        ).count()
        payment_debit_count = Payment.objects.filter(
            transaction__reference="ORDER-1", type=PaymentType.DEBIT
        ).count()
        payment_line_debit_count = PaymentLine.objects.filter(
            payment__transaction__reference="ORDER-1", payment__type=PaymentType.DEBIT
        ).count()

        self.assertEqual(transaction_debit_count, 1)
        self.assertEqual(payment_debit_count, 1)
        self.assertEqual(payment_line_debit_count, 3)

        transaction_credit_count = Transaction.objects.filter(
            reference="ORDER-1", amount__lt=0
        ).count()
        payment_credit_count = Payment.objects.filter(
            transaction__reference="ORDER-1", type=PaymentType.CREDIT
        ).count()
        payment_line_credit_count = PaymentLine.objects.filter(
            payment__transaction__reference="ORDER-1", payment__type=PaymentType.CREDIT
        ).count()

        self.assertEqual(transaction_credit_count, 1)
        self.assertEqual(payment_credit_count, 1)
        self.assertEqual(payment_line_credit_count, 1)

        self.assertEqual(payment_obj.type, PaymentType.DEBIT)
        self.assertEqual(payment_obj.status, PaymentStatus.COMPLETED)
        self.assertEqual(payment_obj.entity, self.order_1_obj.entity)
        self.assertEqual(payment_obj.text, f"Order #{self.order_1_obj.reference}")

        self.assertEqual(
            payment_obj.transaction.source, self.payment_order_1_obj.provider.source
        )
        self.assertEqual(payment_obj.transaction.external_id, "external-order-1")
        self.assertEqual(payment_obj.transaction.reference, "ORDER-1")
        self.assertEqual(
            payment_obj.transaction.method, self.payment_order_1_obj.provider.method
        )
        self.assertEqual(payment_obj.transaction.amount, Money(400, "SEK"))
        self.assertEqual(payment_obj.transaction.vat, int(settings.MODULE_ALL_VAT))
        self.assertEqual(payment_obj.transaction.date_accounting, date_accounting)
        self.assertEqual(payment_obj.transaction.date_interest, date_accounting)
        self.assertEqual(
            payment_obj.transaction.text, f"Order #{self.order_1_obj.reference}"
        )
        self.assertEqual(
            payment_obj.transaction.sender, self.order_1_obj.entity.name.upper()
        )

        item_type_order_product = ContentType.objects.get_by_natural_key(
            "order", "orderproduct"
        )
        # item_type_order_registration = ContentType.objects.get_by_natural_key(
        #     "order", "orderregistration"
        # )
        item_type_order_delivery = ContentType.objects.get_by_natural_key(
            "order", "orderdelivery"
        )

        payment_line_product_objs = list(
            PaymentLine.objects.filter(
                payment=payment_obj, item_type=item_type_order_product
            )
        )
        payment_line_product_amount = sum(
            [
                payment_line_product_obj.amount
                for payment_line_product_obj in payment_line_product_objs
            ]
        )

        self.assertEqual(len(payment_line_product_objs), 2)
        self.assertEqual(payment_line_product_amount, Money(300, "SEK"))

        payment_line_delivery_objs = list(
            PaymentLine.objects.filter(
                payment=payment_obj, item_type=item_type_order_delivery
            )
        )
        payment_line_delivery_amount = sum(
            [
                payment_line_delivery_obj.amount
                for payment_line_delivery_obj in payment_line_delivery_objs
            ]
        )

        self.assertEqual(len(payment_line_delivery_objs), 1)
        self.assertEqual(payment_line_delivery_amount, Money(100, "SEK"))

    def test_create_for_order__order_registration(self, *args, **kwargs):
        date_accounting = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=18, num_inserts=4, num_updates=1
        ):
            payment_obj = create_for_order(
                order_id=self.order_3_obj.id,
                status=PaymentStatus.COMPLETED,
                date_accounting=date_accounting,
                external_id="external-order-3",
                reference="ORDER-3",
            )

        self.assertIsNotNone(payment_obj)

        transaction_count = Transaction.objects.filter(reference="ORDER-3").count()
        payment_count = Payment.objects.filter(transaction__reference="ORDER-3").count()
        payment_line_count = PaymentLine.objects.filter(
            payment__transaction__reference="ORDER-3"
        ).count()

        self.assertEqual(transaction_count, 1)
        self.assertEqual(payment_count, 1)
        self.assertEqual(payment_line_count, 2)

        item_type_order_registration = ContentType.objects.get_by_natural_key(
            "order", "orderregistration"
        )

        payment_line_registration_objs = list(
            PaymentLine.objects.filter(
                payment=payment_obj, item_type=item_type_order_registration
            )
        )
        payment_line_registration_amount = sum(
            [
                payment_line_registration_obj.amount
                for payment_line_registration_obj in payment_line_registration_objs
            ]
        )

        self.assertEqual(len(payment_line_registration_objs), 2)
        self.assertEqual(payment_line_registration_amount, Money(500, "SEK"))

    def test_create_for_order__order_membership(self, *args, **kwargs):
        date_accounting = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=16, num_inserts=4, num_updates=1
        ):
            payment_obj = create_for_order(
                order_id=self.order_4_obj.id,
                status=PaymentStatus.COMPLETED,
                date_accounting=date_accounting,
                external_id="external-order-4",
                reference="ORDER-4",
            )

        self.assertIsNotNone(payment_obj)

        transaction_count = Transaction.objects.filter(reference="ORDER-4").count()
        payment_count = Payment.objects.filter(transaction__reference="ORDER-4").count()
        payment_line_count = PaymentLine.objects.filter(
            payment__transaction__reference="ORDER-4"
        ).count()

        self.assertEqual(transaction_count, 1)
        self.assertEqual(payment_count, 1)
        self.assertEqual(payment_line_count, 2)

        item_type_order_membership = ContentType.objects.get_by_natural_key(
            "order", "ordermembership"
        )

        payment_line_membership_objs = list(
            PaymentLine.objects.filter(
                payment=payment_obj, item_type=item_type_order_membership
            )
        )
        payment_line_membership_amount = sum(
            [
                payment_line_membership_obj.amount
                for payment_line_membership_obj in payment_line_membership_objs
            ]
        )

        self.assertEqual(len(payment_line_membership_objs), 2)
        self.assertEqual(payment_line_membership_amount, Money(500, "SEK"))

    def test_create_for_order__order_created_not_captured(self, *args, **kwargs):
        date_accounting = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=18, num_inserts=5, num_updates=4
        ):
            payment_obj = create_for_order(
                order_id=self.order_2_obj.id,
                status=PaymentStatus.PROCESSING,
                date_accounting=date_accounting,
                external_id="external-order-2",
                reference="ORDER-2",
            )

        self.assertIsNotNone(payment_obj)

        self.assertEqual(payment_obj.type, PaymentType.DEBIT)
        self.assertEqual(payment_obj.status, PaymentStatus.PROCESSING)
        self.assertEqual(payment_obj.entity, self.order_2_obj.entity)
        self.assertEqual(payment_obj.text, f"Order #{self.order_2_obj.reference}")

    def test_create_for_order__order_completed(self, *args, **kwargs):
        date_accounting = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(num=0, num_selects=1):
            with self.assertRaises(AssertionError):
                create_for_order(
                    order_id=self.order_5_obj.id,
                    status=PaymentStatus.COMPLETED,
                    date_accounting=date_accounting,
                    external_id="external-order-3",
                    reference="ORDER-3",
                )
