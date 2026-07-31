from unittest import mock

import pytest
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money
from httpx._client import Response

from comunicat.enums import Module
from comunicat.utils.test.mocks import MockSumUpApiClientExecute
from conftest import NumOperationsMixin
from order.api import clean_pending_orders, complete, delete, update_provider
from order.enums import OrderStatus
from order.tests.factories import (
    OrderDeliveryFactory,
    OrderFactory,
    OrderProductFactory,
    OrderRegistrationFactory,
    PaymentOrderFactory,
)
from payment.enums import PaymentMethod, PaymentStatus, SourceType
from payment.models import Payment, PaymentLine, Transaction
from payment.tests.factories import PaymentProviderFactory, SourceFactory


@pytest.mark.django_db
class TestDelete(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.payment_order_1_obj = PaymentOrderFactory(status=PaymentStatus.CREATED)
        cls.payment_order_2_obj = PaymentOrderFactory(status=PaymentStatus.PROCESSING)
        cls.payment_order_3_obj = PaymentOrderFactory(status=PaymentStatus.COMPLETED)
        cls.payment_order_4_obj = PaymentOrderFactory(status=PaymentStatus.COMPLETED)

        cls.order_1_obj = OrderFactory(
            payment_order=cls.payment_order_1_obj,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            payment_order=cls.payment_order_2_obj,
            status=OrderStatus.CREATED,
        )
        cls.order_3_obj = OrderFactory(
            payment_order=cls.payment_order_3_obj,
            status=OrderStatus.PROCESSING,
        )
        cls.order_4_obj = OrderFactory(
            payment_order=cls.payment_order_4_obj,
            status=OrderStatus.COMPLETED,
        )

    def test_delete__status_created_payment_status_created(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=3, num_inserts=1, num_updates=2
        ):
            is_deleted = delete(
                order_id=self.order_1_obj.id,
                module=Module.ORG,
            )

        self.assertTrue(is_deleted)

        self.order_1_obj.refresh_from_db()
        self.payment_order_1_obj.refresh_from_db()

        self.assertEqual(self.order_1_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.payment_order_1_obj.status, PaymentStatus.CANCELED)

    def test_delete__status_created_payment_status_processing(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=3, num_inserts=1, num_updates=1
        ):
            is_deleted = delete(
                order_id=self.order_2_obj.id,
                module=Module.ORG,
            )

        self.assertTrue(is_deleted)

        self.order_2_obj.refresh_from_db()
        self.payment_order_2_obj.refresh_from_db()

        self.assertEqual(self.order_2_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.payment_order_2_obj.status, PaymentStatus.PROCESSING)

    def test_delete__status_processing_payment_status_completed(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1):
            is_deleted = delete(
                order_id=self.order_3_obj.id,
                module=Module.ORG,
            )

        self.assertFalse(is_deleted)

        self.order_3_obj.refresh_from_db()
        self.payment_order_3_obj.refresh_from_db()

        self.assertEqual(self.order_3_obj.status, OrderStatus.PROCESSING)
        self.assertEqual(self.payment_order_3_obj.status, PaymentStatus.COMPLETED)

    def test_delete__status_completed_payment_status_completed(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1):
            is_deleted = delete(
                order_id=self.order_4_obj.id,
                module=Module.ORG,
            )

        self.assertFalse(is_deleted)

        self.order_4_obj.refresh_from_db()
        self.payment_order_4_obj.refresh_from_db()

        self.assertEqual(self.order_4_obj.status, OrderStatus.COMPLETED)
        self.assertEqual(self.payment_order_4_obj.status, PaymentStatus.COMPLETED)


@pytest.mark.django_db
class TestUpdateProvider(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.payment_provider_1_obj = PaymentProviderFactory(
            method=PaymentMethod.SUMUP, code="SUMUP"
        )
        cls.payment_provider_2_obj = PaymentProviderFactory(
            method=PaymentMethod.SE_SWISH, code="SWISH"
        )

        cls.source_1_obj = SourceFactory(
            type=SourceType.PROVIDER, provider=cls.payment_provider_1_obj
        )

        cls.payment_order_1_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_2_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.PROCESSING
        )

        cls.order_1_obj = OrderFactory(
            payment_order=cls.payment_order_1_obj,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            payment_order=None,
            status=OrderStatus.CREATED,
        )
        cls.order_3_obj = OrderFactory(
            payment_order=cls.payment_order_2_obj,
            status=OrderStatus.PROCESSING,
        )

    def test_update_provider__existing_payment_order(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=21, num_inserts=1, num_updates=1
        ):
            order_obj = update_provider(
                order_id=self.order_1_obj.id,
                provider_id=self.payment_provider_2_obj.id,
                module=Module.ORG,
                user_id=None,
            )

        self.assertIsNotNone(order_obj)
        self.assertIsNotNone(order_obj.payment_order)
        self.assertEqual(order_obj.payment_order.provider, self.payment_provider_2_obj)

    def test_update_provider__new_payment_order(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=15, num_inserts=1, num_updates=2
        ):
            order_obj = update_provider(
                order_id=self.order_2_obj.id,
                provider_id=self.payment_provider_2_obj.id,
                module=Module.ORG,
                user_id=None,
            )

        self.assertIsNotNone(order_obj)
        self.assertIsNotNone(order_obj.payment_order)
        self.assertEqual(order_obj.payment_order.provider, self.payment_provider_2_obj)

    def test_update_provider__status_processing(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1):
            order_obj = update_provider(
                order_id=self.order_3_obj.id,
                provider_id=self.payment_provider_2_obj.id,
                module=Module.ORG,
                user_id=None,
            )

        self.assertIsNone(order_obj)


@pytest.mark.django_db
class TestCleanPendingOrders(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.payment_order_1_obj = PaymentOrderFactory(status=PaymentStatus.CREATED)
        cls.payment_order_2_obj = PaymentOrderFactory(status=PaymentStatus.PENDING)
        cls.payment_order_3_obj = PaymentOrderFactory(status=PaymentStatus.PROCESSING)
        cls.payment_order_4_obj = PaymentOrderFactory(status=PaymentStatus.PROCESSING)
        cls.payment_order_5_obj = PaymentOrderFactory(status=PaymentStatus.COMPLETED)

        cls.order_1_obj = OrderFactory(
            payment_order=cls.payment_order_1_obj,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            payment_order=cls.payment_order_2_obj,
            status=OrderStatus.CREATED,
        )
        cls.order_3_obj = OrderFactory(
            payment_order=cls.payment_order_3_obj,
            status=OrderStatus.REQUESTED,
        )
        cls.order_4_obj = OrderFactory(
            payment_order=cls.payment_order_4_obj,
            status=OrderStatus.PROCESSING,
        )
        cls.order_5_obj = OrderFactory(
            payment_order=cls.payment_order_5_obj,
            status=OrderStatus.COMPLETED,
        )

    @mock.patch(
        "django.utils.timezone.now",
        return_value=timezone.now() + timezone.timedelta(minutes=70),
    )
    def test_clean_pending_orders__status_created(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=1, num_updates=2):
            clean_pending_orders()

        self.payment_order_1_obj.refresh_from_db()
        self.payment_order_2_obj.refresh_from_db()
        self.payment_order_3_obj.refresh_from_db()
        self.payment_order_4_obj.refresh_from_db()
        self.payment_order_5_obj.refresh_from_db()

        self.assertEqual(self.payment_order_1_obj.status, PaymentStatus.CANCELED)
        self.assertEqual(self.payment_order_2_obj.status, PaymentStatus.CANCELED)
        self.assertEqual(self.payment_order_3_obj.status, PaymentStatus.PROCESSING)
        self.assertEqual(self.payment_order_4_obj.status, PaymentStatus.PROCESSING)
        self.assertEqual(self.payment_order_5_obj.status, PaymentStatus.COMPLETED)

        self.order_1_obj.refresh_from_db()
        self.order_2_obj.refresh_from_db()
        self.order_3_obj.refresh_from_db()
        self.order_4_obj.refresh_from_db()
        self.order_5_obj.refresh_from_db()

        self.assertEqual(self.order_1_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.order_2_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.order_3_obj.status, OrderStatus.REQUESTED)
        self.assertEqual(self.order_4_obj.status, OrderStatus.PROCESSING)
        self.assertEqual(self.order_5_obj.status, OrderStatus.COMPLETED)

    @mock.patch(
        "django.utils.timezone.now",
        return_value=timezone.now() + timezone.timedelta(minutes=259205),
    )
    def test_clean_pending_orders__status_requested_or_processing(
        self, *args, **kwargs
    ):
        with self.assertNumOperations(num=0, num_selects=1, num_updates=2):
            clean_pending_orders()

        self.payment_order_1_obj.refresh_from_db()
        self.payment_order_2_obj.refresh_from_db()
        self.payment_order_3_obj.refresh_from_db()
        self.payment_order_4_obj.refresh_from_db()
        self.payment_order_5_obj.refresh_from_db()

        self.assertEqual(self.payment_order_1_obj.status, PaymentStatus.CANCELED)
        self.assertEqual(self.payment_order_2_obj.status, PaymentStatus.CANCELED)
        self.assertEqual(self.payment_order_3_obj.status, PaymentStatus.PROCESSING)
        self.assertEqual(self.payment_order_4_obj.status, PaymentStatus.PROCESSING)
        self.assertEqual(self.payment_order_5_obj.status, PaymentStatus.COMPLETED)

        self.order_1_obj.refresh_from_db()
        self.order_2_obj.refresh_from_db()
        self.order_3_obj.refresh_from_db()
        self.order_4_obj.refresh_from_db()
        self.order_5_obj.refresh_from_db()

        self.assertEqual(self.order_1_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.order_2_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.order_3_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.order_4_obj.status, OrderStatus.ABANDONED)
        self.assertEqual(self.order_5_obj.status, OrderStatus.COMPLETED)


@pytest.mark.django_db
class TestComplete(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.payment_provider_1_obj = PaymentProviderFactory(
            method=PaymentMethod.SUMUP, code="SUMUP"
        )
        cls.payment_provider_2_obj = PaymentProviderFactory(
            method=PaymentMethod.SE_SWISH, code="SWISH"
        )

        cls.source_1_obj = SourceFactory(
            type=SourceType.PROVIDER, provider=cls.payment_provider_1_obj
        )

        cls.payment_order_1_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_2_obj = PaymentOrderFactory(
            provider=cls.payment_provider_2_obj, status=PaymentStatus.CREATED
        )

        cls.order_delivery_1_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))
        cls.order_delivery_2_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))

        cls.order_1_obj = OrderFactory(
            delivery=cls.order_delivery_1_obj,
            payment_order=cls.payment_order_1_obj,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            delivery=cls.order_delivery_2_obj,
            payment_order=cls.payment_order_2_obj,
            status=OrderStatus.CREATED,
        )

        for order_obj in (cls.order_1_obj, cls.order_2_obj):
            OrderProductFactory(
                order=order_obj, quantity=1, amount_unit=Money(200, "SEK")
            )
            OrderProductFactory(
                order=order_obj, quantity=2, amount_unit=Money(50, "SEK")
            )

            OrderRegistrationFactory(order=order_obj, amount=Money(300, "SEK"))
            OrderRegistrationFactory(order=order_obj, amount=Money(200, "SEK"))

        cls.order_3_obj = OrderFactory(
            status=OrderStatus.CREATED,
            payment_order=None,
        )

        cls.order_4_obj = OrderFactory(
            status=OrderStatus.COMPLETED,
            payment_order=None,
        )

    def test_complete__order_created_capture(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(status_code=200, json={"status": "PENDING"}),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=37, num_inserts=8, num_updates=7
            ):
                order_obj = complete(
                    order_id=self.order_1_obj.id,
                    module=Module.ORG,
                    date_paid=date_paid,
                    transaction_id="external-order-1",
                    transaction_reference="ORDER-1",
                    user_id=None,
                    with_notify=True,
                )

        self.assertIsNone(order_obj)

        self.order_1_obj.refresh_from_db()
        self.payment_order_1_obj.refresh_from_db()

        self.assertEqual(self.order_1_obj.status, OrderStatus.REQUESTED)
        self.assertEqual(self.payment_order_1_obj.status, PaymentStatus.PROCESSING)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(status_code=200, json={"status": "PAID"}),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=71, num_inserts=3, num_updates=12
            ):
                order_obj = complete(
                    order_id=self.order_1_obj.id,
                    module=Module.ORG,
                    date_paid=date_paid,
                    transaction_id="external-order-1",
                    transaction_reference="ORDER-1",
                    user_id=None,
                    with_notify=True,
                )

        self.assertIsNotNone(order_obj)

        self.assertEqual(order_obj.status, OrderStatus.PROCESSING)
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.COMPLETED)

        transaction_count = Transaction.objects.filter(reference="ORDER-1").count()
        payment_count = Payment.objects.filter(transaction__reference="ORDER-1").count()
        payment_line_count = PaymentLine.objects.filter(
            payment__transaction__reference="ORDER-1"
        ).count()

        self.assertEqual(transaction_count, 1)
        self.assertEqual(payment_count, 1)
        self.assertEqual(payment_line_count, 5)

    def test_complete__order_created_autocapture(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=40, num_inserts=2, num_updates=2
        ):
            order_obj = complete(
                order_id=self.order_2_obj.id,
                module=Module.ORG,
                date_paid=date_paid,
                transaction_id="external-order-2",
                transaction_reference="ORDER-2",
                user_id=None,
                with_notify=True,
            )

        self.assertIsNotNone(order_obj)

        self.assertEqual(order_obj.status, OrderStatus.REQUESTED)
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.PROCESSING)

        transaction_count = Transaction.objects.filter(reference="ORDER-2").count()
        payment_count = Payment.objects.filter(transaction__reference="ORDER-2").count()
        payment_line_count = PaymentLine.objects.filter(
            payment__transaction__reference="ORDER-2"
        ).count()

        self.assertEqual(transaction_count, 0)
        self.assertEqual(payment_count, 0)
        self.assertEqual(payment_line_count, 0)

    def test_complete__order_created_no_payment_order(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(num=0, num_selects=1):
            order_obj = complete(
                order_id=self.order_3_obj.id,
                module=Module.ORG,
                date_paid=date_paid,
                transaction_id="external-order-3",
                transaction_reference="ORDER-3",
                with_notify=True,
            )

        self.assertIsNone(order_obj)

    def test_complete__order_completed(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(num=0, num_selects=1):
            order_obj = complete(
                order_id=self.order_4_obj.id,
                module=Module.ORG,
                date_paid=date_paid,
                transaction_id="external-order-4",
                transaction_reference="ORDER-4",
                with_notify=True,
            )

        self.assertIsNone(order_obj)
