import random

from django.utils import timezone
from djmoney.money import Money
from factory import LazyAttribute, LazyFunction, SelfAttribute, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from activity.enums import ProgramCourseRegistrationStatus, ProgramType
from activity.models import (
    Program,
    ProgramCourse,
    ProgramCoursePrice,
    ProgramCourseRegistration,
)
from comunicat.enums import Module
from comunicat.utils.factories import fake_title


class ProgramFactory(DjangoModelFactory):
    name = LazyFunction(fake_title)
    description = LazyFunction(fake_title)

    module = FuzzyChoice(Module)
    type = FuzzyChoice(ProgramType)

    class Meta:
        model = Program


class ProgramCourseFactory(DjangoModelFactory):
    program = SubFactory(ProgramFactory)

    date_from = LazyFunction(lambda: timezone.localdate())
    date_to = LazyFunction(lambda: timezone.localdate() + timezone.timedelta(days=365))

    signup_until = None

    class Meta:
        model = ProgramCourse


class ProgramCoursePriceFactory(DjangoModelFactory):
    course = SubFactory(ProgramCourseFactory)

    age_from = None
    age_to = None

    min_registrations = 0

    amount = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))

    class Meta:
        model = ProgramCoursePrice


class ProgramCourseRegistrationFactory(DjangoModelFactory):
    course = SubFactory(ProgramCourseFactory)
    entity = SubFactory("payment.tests.factories.EntityFactory")

    status = FuzzyChoice(ProgramCourseRegistrationStatus)

    price = SubFactory(ProgramCoursePriceFactory)

    amount = SelfAttribute("price.amount")

    line = SubFactory("payment.tests.factories.PaymentLineFactory")

    class Meta:
        model = ProgramCourseRegistration
