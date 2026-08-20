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
from order.enums import OrderStatus, OrderType
from order.tests.factories import (
    OrderDeliveryFactory,
    OrderFactory,
    OrderMembershipFactory,
    OrderProductFactory,
    OrderRegistrationFactory,
    PaymentOrderFactory,
)
from payment.enums import PaymentMethod, PaymentStatus, PaymentType, SourceType
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
            method=PaymentMethod.TRANSFER, code="TRANSFER"
        )

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
            method=PaymentMethod.TRANSFER, code="TRANSFER"
        )

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
            provider=cls.payment_provider_2_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_3_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_4_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )

        cls.order_delivery_1_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))
        cls.order_delivery_2_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))
        cls.order_delivery_3_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))
        cls.order_delivery_4_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))

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
            delivery=cls.order_delivery_3_obj,
            payment_order=cls.payment_order_3_obj,
            type=OrderType.REGISTRATION,
            status=OrderStatus.CREATED,
        )
        cls.order_4_obj = OrderFactory(
            delivery=cls.order_delivery_4_obj,
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

        OrderMembershipFactory(order=cls.order_4_obj, amount=Money(300, "SEK"))
        OrderMembershipFactory(order=cls.order_4_obj, amount=Money(200, "SEK"))

        cls.order_5_obj = OrderFactory(
            status=OrderStatus.CREATED,
            payment_order=None,
        )

        cls.order_6_obj = OrderFactory(
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
                num=0, num_selects=33, num_inserts=5, num_updates=4
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

        self.assertEqual(self.order_1_obj.status, OrderStatus.CREATED)
        self.assertEqual(self.payment_order_1_obj.status, PaymentStatus.CREATED)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(
                    status_code=200,
                    json={
                        "status": "PAID",
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "status": "PAID",
                        "transactions": [
                            {"id": "transaction-1", "status": "FAILED"},
                            {"id": "transaction-2", "status": "SUCCESSFUL"},
                        ],
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "id": "transaction-2",
                        "amount": 400,
                        "transaction_events": [{"event_type": "PAYOUT", "amount": 350}],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=66, num_inserts=6, num_updates=9
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

        transaction_objs = list(
            Transaction.objects.filter(reference="ORDER-1").order_by("-amount")
        )
        payment_objs = list(
            Payment.objects.filter(transaction__reference="ORDER-1").order_by("type")
        )
        payment_line_objs = list(
            PaymentLine.objects.filter(
                payment__transaction__reference="ORDER-1"
            ).order_by("payment__type")
        )

        self.assertEqual(len(transaction_objs), 2)
        self.assertEqual(len(payment_objs), 2)
        self.assertEqual(len(payment_line_objs), 4)

        transaction_debit_obj = transaction_objs[0]
        transaction_credit_obj = transaction_objs[1]

        payment_debit_obj = payment_objs[0]
        payment_credit_obj = payment_objs[1]

        payment_line_debit_objs = payment_line_objs[:-1]
        payment_line_credit_objs = payment_line_objs[-1:]

        self.assertEqual(transaction_debit_obj.external_id, "external-order-1")
        self.assertEqual(transaction_debit_obj.reference, "ORDER-1")
        self.assertEqual(transaction_debit_obj.amount, Money(400, "SEK"))
        self.assertEqual(
            transaction_debit_obj.text, f"Order #{self.order_1_obj.reference}"
        )

        self.assertEqual(transaction_credit_obj.external_id, "external-order-1")
        self.assertEqual(transaction_credit_obj.reference, "ORDER-1")
        self.assertEqual(transaction_credit_obj.amount, Money(-50, "SEK"))
        self.assertEqual(
            transaction_credit_obj.text, f"Order fee #{self.order_1_obj.reference}"
        )

        self.assertEqual(payment_debit_obj.type, PaymentType.DEBIT)
        self.assertEqual(payment_debit_obj.transaction, transaction_debit_obj)
        self.assertEqual(payment_debit_obj.text, f"Order #{self.order_1_obj.reference}")

        self.assertEqual(payment_credit_obj.type, PaymentType.CREDIT)
        self.assertEqual(payment_credit_obj.transaction, transaction_credit_obj)
        self.assertEqual(
            payment_credit_obj.text, f"Order fee #{self.order_1_obj.reference}"
        )

        for payment_line_debit_obj in payment_line_debit_objs:
            self.assertGreaterEqual(payment_line_debit_obj.amount, Money(0, "SEK"))
            self.assertEqual(payment_line_debit_obj.payment, payment_debit_obj)

        for payment_line_credit_obj in payment_line_credit_objs:
            self.assertEqual(payment_line_credit_obj.amount, Money(50, "SEK"))
            self.assertEqual(payment_line_credit_obj.payment, payment_credit_obj)

    def test_complete__order_created_autocapture(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=36, num_inserts=2, num_updates=2
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

    def test_complete__order_registration(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(
                    status_code=200,
                    json={
                        "status": "PAID",
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "status": "PAID",
                        "transactions": [
                            {"id": "transaction-1", "status": "SUCCESSFUL"},
                        ],
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "id": "transaction-1",
                        "amount": 600,
                        "transaction_events": [{"event_type": "PAYOUT", "amount": 550}],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=56, num_inserts=10, num_updates=6
            ):
                order_obj = complete(
                    order_id=self.order_3_obj.id,
                    module=Module.ORG,
                    date_paid=date_paid,
                    transaction_id="external-order-3",
                    transaction_reference="ORDER-3",
                    user_id=None,
                    with_notify=True,
                )

        self.assertIsNotNone(order_obj)

        self.assertEqual(order_obj.status, OrderStatus.PROCESSING)
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.COMPLETED)

        transaction_objs = list(
            Transaction.objects.filter(reference="ORDER-3").order_by("-amount")
        )
        payment_objs = list(
            Payment.objects.filter(transaction__reference="ORDER-3").order_by("type")
        )
        payment_line_objs = list(
            PaymentLine.objects.filter(
                payment__transaction__reference="ORDER-3"
            ).order_by("payment__type")
        )

        self.assertEqual(len(transaction_objs), 2)
        self.assertEqual(len(payment_objs), 2)
        self.assertEqual(len(payment_line_objs), 4)

        transaction_debit_obj = transaction_objs[0]

        self.assertEqual(transaction_debit_obj.external_id, "external-order-3")
        self.assertEqual(transaction_debit_obj.reference, "ORDER-3")
        self.assertEqual(transaction_debit_obj.amount, Money(600, "SEK"))
        self.assertEqual(
            transaction_debit_obj.text, f"Order #{self.order_3_obj.reference}"
        )

    def test_complete__order_membership(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(
                    status_code=200,
                    json={
                        "status": "PAID",
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "status": "PAID",
                        "transactions": [
                            {"id": "transaction-1", "status": "SUCCESSFUL"},
                        ],
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "id": "transaction-1",
                        "amount": 600,
                        "transaction_events": [{"event_type": "PAYOUT", "amount": 550}],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=54, num_inserts=10, num_updates=6
            ):
                order_obj = complete(
                    order_id=self.order_4_obj.id,
                    module=Module.ORG,
                    date_paid=date_paid,
                    transaction_id="external-order-4",
                    transaction_reference="ORDER-4",
                    user_id=None,
                    with_notify=True,
                )

        self.assertIsNotNone(order_obj)

        self.assertEqual(order_obj.status, OrderStatus.PROCESSING)
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.COMPLETED)

        transaction_objs = list(
            Transaction.objects.filter(reference="ORDER-4").order_by("-amount")
        )
        payment_objs = list(
            Payment.objects.filter(transaction__reference="ORDER-4").order_by("type")
        )
        payment_line_objs = list(
            PaymentLine.objects.filter(
                payment__transaction__reference="ORDER-4"
            ).order_by("payment__type")
        )

        self.assertEqual(len(transaction_objs), 2)
        self.assertEqual(len(payment_objs), 2)
        self.assertEqual(len(payment_line_objs), 4)

        transaction_debit_obj = transaction_objs[0]

        self.assertEqual(transaction_debit_obj.external_id, "external-order-4")
        self.assertEqual(transaction_debit_obj.reference, "ORDER-4")
        self.assertEqual(transaction_debit_obj.amount, Money(600, "SEK"))
        self.assertEqual(
            transaction_debit_obj.text, f"Order #{self.order_4_obj.reference}"
        )

    def test_complete__order_created_no_payment_order(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(num=0, num_selects=1):
            order_obj = complete(
                order_id=self.order_5_obj.id,
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
                order_id=self.order_6_obj.id,
                module=Module.ORG,
                date_paid=date_paid,
                transaction_id="external-order-4",
                transaction_reference="ORDER-4",
                with_notify=True,
            )

        self.assertIsNone(order_obj)
