import pytest
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from django.utils import timezone
from djmoney.money import Money

from conftest import NumOperationsMixin
from order.enums import OrderStatus
from order.tests.factories import (
    OrderDeliveryFactory,
    OrderFactory,
    OrderProductFactory,
    PaymentOrderFactory,
)
from payment.api import create_for_order
from payment.enums import PaymentMethod, PaymentStatus, PaymentType, SourceType
from payment.models import PaymentLine
from payment.tests.factories import PaymentProviderFactory, SourceFactory


@pytest.mark.django_db
class TestCreateForOrder(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.payment_provider_1_obj = PaymentProviderFactory(method=PaymentMethod.CARD)

        cls.source_1_obj = SourceFactory(
            type=SourceType.PROVIDER, provider=cls.payment_provider_1_obj
        )

        cls.payment_order_1_obj = PaymentOrderFactory(
            provider=cls.payment_provider_1_obj, status=PaymentStatus.CREATED
        )

        cls.order_delivery_1_obj = OrderDeliveryFactory(price__price=Money(100, "SEK"))

        cls.order_1_obj = OrderFactory(
            delivery=cls.order_delivery_1_obj,
            payment_order=cls.payment_order_1_obj,
            status=OrderStatus.CREATED,
        )

        cls.order_1_product_1_obj = OrderProductFactory(
            order=cls.order_1_obj, quantity=1, amount_unit=Money(200, "SEK")
        )
        cls.order_1_product_2_obj = OrderProductFactory(
            order=cls.order_1_obj, quantity=2, amount_unit=Money(50, "SEK")
        )

    def test_create_for_order__order_created(self, *args, **kwargs):
        date_accounting = timezone.localdate() + timezone.timedelta(days=1)
        payment_obj = create_for_order(
            order_id=self.order_1_obj.id,
            date_accounting=date_accounting,
            external_id="external-order-1",
            reference="ORDER-1",
        )

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
        self.assertEqual(payment_obj.transaction.vat, settings.MODULE_ALL_VAT)
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
        item_type_order_registration = ContentType.objects.get_by_natural_key(
            "order", "orderregistration"
        )
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

        payment_line_registration_objs = list(
            PaymentLine.objects.filter(
                payment=payment_obj, item_type=item_type_order_registration
            )
        )
        # payment_line_registration_amount = sum([payment_line_registration_obj.amount for payment_line_registration_obj in payment_line_registration_objs])

        self.assertEqual(len(payment_line_registration_objs), 0)
        # self.assertEqual(payment_line_registration_amount, Money(0, "SEK"))

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
