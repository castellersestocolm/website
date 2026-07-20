import random

from django.utils import timezone
from djmoney.money import Money
from factory import LazyAttribute, LazyFunction, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from membership.enums import MembershipStatus
from membership.models import Membership, MembershipModule, MembershipUser


class MembershipFactory(DjangoModelFactory):
    status = FuzzyChoice(MembershipStatus)

    date_from = LazyFunction(lambda: timezone.localdate())
    date_to = LazyFunction(lambda: timezone.localdate() + timezone.timedelta(days=365))

    date_end = None

    class Meta:
        model = Membership


class MembershipModuleFactory(DjangoModelFactory):
    membership = SubFactory(MembershipFactory)

    status = FuzzyChoice(MembershipStatus)
    amount = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))
    module = FuzzyChoice(Module)

    class Meta:
        model = MembershipModule


class MembershipUserFactory(DjangoModelFactory):
    user = SubFactory("user.tests.factories.UserFactory")
    family = SubFactory("user.tests.factories.FamilyFactory")
    membership = SubFactory(MembershipFactory)

    class Meta:
        model = MembershipUser
