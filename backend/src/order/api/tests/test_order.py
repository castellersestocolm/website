from unittest import mock

import pytest
from django.core import mail
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money
from httpx._client import Response

from activity.enums import ProgramCourseRegistrationStatus
from activity.tests.factories import (
    ProgramCourseFactory,
    ProgramCourseRegistrationFactory,
)
from comunicat.enums import Module
from comunicat.utils.test import run_commit_hooks
from comunicat.utils.test.mocks import MockSumUpApiClientExecute
from conftest import NumOperationsMixin
from event.enums import RegistrationStatus
from event.tests.factories import EventFactory, RegistrationFactory
from membership.enums import MembershipStatus
from membership.tests.factories import (
    MembershipFactory,
    MembershipModuleFactory,
    MembershipUserFactory,
)
from order.api import clean_pending_orders, complete, delete, update_provider
from order.enums import OrderStatus, OrderType
from order.tests.factories import (
    OrderCourseFactory,
    OrderDeliveryFactory,
    OrderFactory,
    OrderMembershipFactory,
    OrderProductFactory,
    OrderRegistrationFactory,
    PaymentOrderFactory,
)
from payment.enums import PaymentMethod, PaymentStatus, PaymentType, SourceType
from payment.models import Payment, PaymentLine, Transaction
from payment.tests.factories import EntityFactory, PaymentProviderFactory, SourceFactory
from user.enums import FamilyMemberRole, FamilyMemberStatus
from user.tests.factories import FamilyFactory, FamilyMemberFactory, UserFactory


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
            num=0, num_selects=29, num_inserts=1, num_updates=1
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
            num=0, num_selects=20, num_inserts=1, num_updates=2
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
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            payment_order=cls.payment_order_2_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
        )
        cls.order_3_obj = OrderFactory(
            payment_order=cls.payment_order_3_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.REQUESTED,
        )
        cls.order_4_obj = OrderFactory(
            payment_order=cls.payment_order_4_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.PROCESSING,
        )
        cls.order_5_obj = OrderFactory(
            payment_order=cls.payment_order_5_obj,
            type=OrderType.PRODUCT,
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

        cls.user_member_1_obj = UserFactory(
            firstname="firstname-1",
            lastname="lastname-1",
            email="user-member-1@domain-test.org",
        )
        cls.user_member_2_obj = UserFactory(
            firstname="firstname-2",
            lastname="lastname-2",
            email="user-member-1+user-member-2@domain-test.org",
            birthday=timezone.localdate().replace(year=timezone.localdate().year - 8),
        )
        cls.user_member_3_obj = UserFactory(
            firstname="firstname-3",
            lastname="lastname-3",
            email="user-member-1+user-member-3@domain-test.org",
            birthday=timezone.localdate().replace(year=timezone.localdate().year - 6),
        )

        cls.entity_member_1_obj = EntityFactory(user=cls.user_member_1_obj)
        cls.entity_member_2_obj = EntityFactory(user=cls.user_member_2_obj)
        cls.entity_member_3_obj = EntityFactory(user=cls.user_member_3_obj)

        cls.family_1_obj = FamilyFactory()

        cls.family_1_user_1_obj = FamilyMemberFactory(
            user=cls.user_member_1_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_1_user_2_obj = FamilyMemberFactory(
            user=cls.user_member_2_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MEMBER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_1_user_3_obj = FamilyMemberFactory(
            user=cls.user_member_3_obj,
            family=cls.family_1_obj,
            role=FamilyMemberRole.MEMBER,
            status=FamilyMemberStatus.ACTIVE,
        )

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
        cls.payment_order_5_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )
        cls.payment_order_6_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )

        cls.order_delivery_1_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))
        cls.order_delivery_2_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))

        cls.order_1_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            delivery=cls.order_delivery_1_obj,
            payment_order=cls.payment_order_1_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
        )
        cls.order_2_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            delivery=cls.order_delivery_2_obj,
            payment_order=cls.payment_order_2_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
        )
        cls.order_3_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            delivery=None,
            payment_order=cls.payment_order_3_obj,
            type=OrderType.REGISTRATION,
            status=OrderStatus.CREATED,
        )
        cls.order_4_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            delivery=None,
            payment_order=cls.payment_order_4_obj,
            type=OrderType.MEMBERSHIP,
            status=OrderStatus.CREATED,
        )
        cls.order_5_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            delivery=None,
            payment_order=cls.payment_order_5_obj,
            type=OrderType.COURSE,
            status=OrderStatus.CREATED,
        )

        for order_obj in (cls.order_1_obj, cls.order_2_obj):
            OrderProductFactory(
                order=order_obj, quantity=1, amount_unit=Money(200, "SEK")
            )
            OrderProductFactory(
                order=order_obj, quantity=2, amount_unit=Money(50, "SEK")
            )

        cls.event_1_obj = EventFactory()

        cls.registration_1_obj = RegistrationFactory(
            status=RegistrationStatus.REQUESTED,
            event=cls.event_1_obj,
        )
        cls.registration_2_obj = RegistrationFactory(
            status=RegistrationStatus.REQUESTED,
            event=cls.event_1_obj,
        )

        OrderRegistrationFactory(
            order=cls.order_3_obj,
            registration=cls.registration_1_obj,
            amount=Money(300, "SEK"),
        )
        OrderRegistrationFactory(
            order=cls.order_3_obj,
            registration=cls.registration_2_obj,
            amount=Money(200, "SEK"),
        )

        cls.membership_1_obj = MembershipFactory(status=MembershipStatus.REQUESTED)
        cls.membership_module_1_obj = MembershipModuleFactory(
            membership=cls.membership_1_obj,
            module=Module.ORG,
            status=MembershipStatus.REQUESTED,
            amount=Money(300, "SEK"),
        )
        cls.membership_module_2_obj = MembershipModuleFactory(
            membership=cls.membership_1_obj,
            module=Module.TOWERS,
            status=MembershipStatus.REQUESTED,
            amount=Money(200, "SEK"),
        )

        MembershipUserFactory(
            family=cls.family_1_obj,
            user=cls.user_member_1_obj,
            membership=cls.membership_1_obj,
        )
        MembershipUserFactory(
            family=cls.family_1_obj,
            user=cls.user_member_2_obj,
            membership=cls.membership_1_obj,
        )
        MembershipUserFactory(
            family=cls.family_1_obj,
            user=cls.user_member_3_obj,
            membership=cls.membership_1_obj,
        )

        OrderMembershipFactory(
            order=cls.order_4_obj,
            module=cls.membership_module_1_obj,
            amount=Money(300, "SEK"),
        )
        OrderMembershipFactory(
            order=cls.order_4_obj,
            module=cls.membership_module_2_obj,
            amount=Money(200, "SEK"),
        )

        cls.program_course_1_obj = ProgramCourseFactory()

        cls.program_course_registration_1_obj = ProgramCourseRegistrationFactory(
            status=ProgramCourseRegistrationStatus.REQUESTED,
            entity=cls.entity_member_2_obj,
            course=cls.program_course_1_obj,
        )
        cls.program_course_registration_2_obj = ProgramCourseRegistrationFactory(
            status=ProgramCourseRegistrationStatus.REQUESTED,
            entity=cls.entity_member_3_obj,
            course=cls.program_course_1_obj,
        )

        OrderCourseFactory(
            order=cls.order_5_obj,
            registration=cls.program_course_registration_1_obj,
            amount=Money(300, "SEK"),
        )
        OrderCourseFactory(
            order=cls.order_5_obj,
            registration=cls.program_course_registration_2_obj,
            amount=Money(200, "SEK"),
        )

        cls.order_6_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
            payment_order=None,
        )

        cls.order_7_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.COMPLETED,
            payment_order=None,
        )

        cls.order_8_obj = OrderFactory(
            entity=cls.entity_member_1_obj,
            type=OrderType.PRODUCT,
            status=OrderStatus.CREATED,
            payment_order=cls.payment_order_6_obj,
        )

    def test_complete__order_created_capture(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(status_code=200, json={"status": "PENDING"}),
                Response(
                    status_code=200,
                    json={
                        "status": "PENDING",
                        "transactions": [
                            {"id": "transaction-1", "status": "FAILED"},
                            {"id": "transaction-2", "status": "PENDING"},
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
                num=0, num_selects=53, num_inserts=9, num_updates=6
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

        self.assertEqual(order_obj.status, OrderStatus.REQUESTED)
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.PROCESSING)

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
                num=0, num_selects=73, num_inserts=4, num_updates=12
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

        run_commit_hooks()

        self.assertEqual(len(mail.outbox), 1)

        email_subject = mail.outbox[0].subject
        email_text = mail.outbox[0].body

        self.assertEqual(
            email_subject, f"Your order #{self.order_1_obj.reference} is now paid"
        )
        self.assertIn("firstname-1 lastname-1", email_text)
        self.assertIn("paid", email_text)

    def test_complete__order_created_autocapture(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(
            num=0, num_selects=31, num_inserts=1, num_updates=2
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
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.PENDING)

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
                        "amount": 500,
                        "transaction_events": [{"event_type": "PAYOUT", "amount": 450}],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=57, num_inserts=8, num_updates=5
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

        self.assertEqual(order_obj.status, OrderStatus.COMPLETED)
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
        self.assertEqual(len(payment_line_objs), 3)

        transaction_debit_obj = transaction_objs[0]

        self.assertEqual(transaction_debit_obj.external_id, "external-order-3")
        self.assertEqual(transaction_debit_obj.reference, "ORDER-3")
        self.assertEqual(transaction_debit_obj.amount, Money(500, "SEK"))
        self.assertEqual(transaction_debit_obj.text, self.event_1_obj.title_locale)

        run_commit_hooks()

        self.assertEqual(len(mail.outbox), 0)

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
                        "amount": 500,
                        "transaction_events": [{"event_type": "PAYOUT", "amount": 450}],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=70, num_inserts=9, num_updates=8
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

        self.assertEqual(order_obj.status, OrderStatus.COMPLETED)
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
        self.assertEqual(len(payment_line_objs), 3)

        transaction_debit_obj = transaction_objs[0]

        self.assertEqual(transaction_debit_obj.external_id, "external-order-4")
        self.assertEqual(transaction_debit_obj.reference, "ORDER-4")
        self.assertEqual(transaction_debit_obj.amount, Money(500, "SEK"))
        self.assertEqual(
            transaction_debit_obj.text, f"Membership {timezone.localdate().year}"
        )

        run_commit_hooks()

        self.assertEqual(len(mail.outbox), 1)

        email_subject = mail.outbox[0].subject
        email_text = mail.outbox[0].body

        self.assertEqual(email_subject, "Your membership is now paid")
        self.assertIn("firstname-1 lastname-1", email_text)
        self.assertIn("paid", email_text)

    def test_complete__order_course(self, *args, **kwargs):
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
                        "amount": 500,
                        "transaction_events": [{"event_type": "PAYOUT", "amount": 450}],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(
                num=0, num_selects=79, num_inserts=9, num_updates=6
            ):
                order_obj = complete(
                    order_id=self.order_5_obj.id,
                    module=Module.ORG,
                    date_paid=date_paid,
                    transaction_id="external-order-5",
                    transaction_reference="ORDER-5",
                    user_id=None,
                    with_notify=True,
                )

        self.assertIsNotNone(order_obj)

        self.assertEqual(order_obj.status, OrderStatus.COMPLETED)
        self.assertEqual(order_obj.payment_order.status, PaymentStatus.COMPLETED)

        transaction_objs = list(
            Transaction.objects.filter(reference="ORDER-5").order_by("-amount")
        )
        payment_objs = list(
            Payment.objects.filter(transaction__reference="ORDER-5").order_by("type")
        )
        payment_line_objs = list(
            PaymentLine.objects.filter(
                payment__transaction__reference="ORDER-5"
            ).order_by("payment__type")
        )

        self.assertEqual(len(transaction_objs), 2)
        self.assertEqual(len(payment_objs), 2)
        self.assertEqual(len(payment_line_objs), 3)

        transaction_debit_obj = transaction_objs[0]

        self.assertEqual(transaction_debit_obj.external_id, "external-order-5")
        self.assertEqual(transaction_debit_obj.reference, "ORDER-5")
        self.assertEqual(transaction_debit_obj.amount, Money(500, "SEK"))
        self.assertEqual(
            transaction_debit_obj.text,
            self.program_course_registration_1_obj.course.program.name_locale,
        )

        run_commit_hooks()

        self.assertEqual(len(mail.outbox), 1)

        email_subject = mail.outbox[0].subject
        email_text = mail.outbox[0].body

        self.assertEqual(
            email_subject,
            f"Your registration is now paid — {self.program_course_registration_1_obj.course.program.name_locale} {timezone.localdate().year}",
        )
        self.assertIn("firstname-1 lastname-1", email_text)
        self.assertIn("paid", email_text)
        self.assertIn(
            self.program_course_registration_1_obj.course.program.name_locale,
            email_text,
        )

    def test_complete__order_created_no_payment_order(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(num=0, num_selects=4):
            order_obj = complete(
                order_id=self.order_6_obj.id,
                module=Module.ORG,
                date_paid=date_paid,
                transaction_id="external-order-6",
                transaction_reference="ORDER-6",
                with_notify=True,
            )

        self.assertIsNone(order_obj)

    def test_complete__order_completed(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with self.assertNumOperations(num=0, num_selects=1):
            order_obj = complete(
                order_id=self.order_7_obj.id,
                module=Module.ORG,
                date_paid=date_paid,
                transaction_id="external-order-7",
                transaction_reference="ORDER-7",
                with_notify=True,
            )

        self.assertIsNone(order_obj)

    def test_complete__order_not_completed(self, *args, **kwargs):
        date_paid = timezone.localdate() + timezone.timedelta(days=1)

        with mock.patch(
            "httpx._client.Client.get",
            side_effect=MockSumUpApiClientExecute(
                Response(
                    status_code=200,
                    json={
                        "status": "CANCELLED",
                    },
                ),
                Response(
                    status_code=200,
                    json={
                        "status": "CANCELLED",
                        "transactions": [
                            {"id": "transaction-1", "status": "CANCELLED"},
                        ],
                    },
                ),
            ),
        ):
            with self.assertNumOperations(num=0, num_selects=15):
                order_obj = complete(
                    order_id=self.order_8_obj.id,
                    module=Module.ORG,
                    date_paid=date_paid,
                    transaction_id="external-order-8",
                    transaction_reference="ORDER-8",
                    with_notify=True,
                )

        self.assertIsNone(order_obj)

        transaction_objs = list(
            Transaction.objects.filter(reference="ORDER-8").order_by("-amount")
        )
        payment_objs = list(
            Payment.objects.filter(transaction__reference="ORDER-8").order_by("type")
        )
        payment_line_objs = list(
            PaymentLine.objects.filter(
                payment__transaction__reference="ORDER-8"
            ).order_by("payment__type")
        )

        self.assertEqual(len(transaction_objs), 0)
        self.assertEqual(len(payment_objs), 0)
        self.assertEqual(len(payment_line_objs), 0)
