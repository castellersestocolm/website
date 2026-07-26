import random
from uuid import uuid4

from django.conf import settings
from djmoney.money import Money
from factory import Faker, LazyAttribute, LazyFunction, SelfAttribute, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_string
from order.enums import OrderDeliveryType
from order.models import (
    DeliveryPrice,
    DeliveryProvider,
    Order,
    OrderDelivery,
    OrderDeliveryAddress,
    OrderProduct,
)
from payment.enums import PaymentStatus
from payment.models import PaymentOrder
from payment.tests.factories import PaymentProviderFactory


class DeliveryProviderFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    # description = LazyFunction(fake_title)

    type = FuzzyChoice(OrderDeliveryType)

    is_enabled = True

    class Meta:
        model = DeliveryProvider


class OrderDeliveryAddressFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    # description = LazyFunction(fake_title)
    address = Faker("street_address")
    apartment = Faker("building_number")
    address2 = None

    postcode = Faker("postcode")
    city = Faker("city")

    country = SubFactory("data.tests.factories.CountryFactory")
    region = SubFactory("data.tests.factories.RegionFactory")

    class Meta:
        model = OrderDeliveryAddress


class DeliveryPriceFactory(DjangoModelFactory):
    provider = SubFactory(DeliveryProviderFactory)

    zone = SubFactory("data.tests.factories.ZoneFactory")
    country = SubFactory("data.tests.factories.CountryFactory")
    region = SubFactory("data.tests.factories.RegionFactory")

    price = LazyAttribute(lambda n: Money(random.randint(100, 200), "SEK"))
    vat = 0

    class Meta:
        model = DeliveryPrice


class OrderDeliveryFactory(DjangoModelFactory):
    provider = SubFactory(DeliveryProviderFactory)
    address = SubFactory(OrderDeliveryAddressFactory)

    # TODO: Factory add event
    # event = SubFactory("event.tests.factories.EventFactory")

    line = SubFactory("payment.tests.factories.PaymentLineFactory")

    price = SubFactory(DeliveryPriceFactory)

    amount = SelfAttribute("price.price")
    vat = SelfAttribute("price.vat")

    class Meta:
        model = OrderDelivery


class PaymentOrderFactory(DjangoModelFactory):
    provider = SubFactory(PaymentProviderFactory)

    status = FuzzyChoice(PaymentStatus)

    external_id = LazyFunction(lambda: str(uuid4()))

    class Meta:
        model = PaymentOrder


class OrderFactory(DjangoModelFactory):
    entity = SubFactory("payment.tests.factories.EntityFactory")
    delivery = SubFactory(OrderDeliveryFactory)
    payment_order = SubFactory(PaymentOrderFactory)

    reference = LazyFunction(lambda: fake_string(length=8).upper())

    status = FuzzyChoice(PaymentStatus)

    origin_module = FuzzyChoice(Module)
    origin_language = settings.LANGUAGE_CODE

    class Meta:
        model = Order


class OrderProductFactory(DjangoModelFactory):
    order = SubFactory(OrderFactory)

    size = SubFactory("product.tests.factories.ProductSizeFactory")

    line = SubFactory("payment.tests.factories.PaymentLineFactory")

    quantity = LazyAttribute(lambda n: random.randint(1, 3))
    quantity_given = 0

    amount_unit = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))
    amount = LazyAttribute(lambda n: n.quantity * n.amount_unit)
    vat = 0

    class Meta:
        model = OrderProduct
