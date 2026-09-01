import random

from django.utils import timezone
from djmoney.money import Money
from factory import Faker, LazyAttribute, LazyFunction, SelfAttribute, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_string, fake_title
from event.enums import EventStatus, EventType, RegistrationStatus
from event.models import Event, EventPrice, Location, Registration


class LocationFactory(DjangoModelFactory):
    name = Faker("name")
    address = Faker("address")

    description = LazyFunction(fake_title)

    coordinate_lat = Faker("latitude")
    coordinate_lon = Faker("longitude")

    class Meta:
        model = Location


class EventFactory(DjangoModelFactory):
    title = LazyFunction(fake_title)

    code = LazyFunction(lambda: fake_string(length=10))

    time_from = LazyFunction(lambda: timezone.localtime() + timezone.timedelta(days=1))
    time_to = LazyFunction(
        lambda: timezone.localtime() + timezone.timedelta(days=1, hours=1)
    )

    location = SubFactory(LocationFactory)

    description = LazyFunction(fake_title)

    series = None

    type = FuzzyChoice(EventType)
    status = FuzzyChoice(EventStatus)
    module = FuzzyChoice(Module)

    # TODO: Factory add courses
    course = None

    max_registrations = None

    class Meta:
        model = Event


class EventPriceFactory(DjangoModelFactory):
    event = SubFactory(EventFactory)

    module = FuzzyChoice(Module)

    age_from = None
    age_to = None

    min_registrations = 0

    amount = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))

    class Meta:
        model = EventPrice


class RegistrationFactory(DjangoModelFactory):
    event = SubFactory(EventFactory)
    entity = SubFactory("payment.tests.factories.EntityFactory")

    owner = SelfAttribute("entity")

    status = FuzzyChoice(RegistrationStatus)

    line = SubFactory("payment.tests.factories.PaymentLineFactory")

    price = SubFactory(EventPriceFactory)

    class Meta:
        model = Registration
