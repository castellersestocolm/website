from django.utils import timezone
from factory import Faker, LazyFunction, SelfAttribute, Sequence, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_title
from legal.enums import TeamType
from legal.models import Group, Member, Role, Team


class GroupFactory(DjangoModelFactory):
    module = FuzzyChoice(Module)

    date_from = LazyFunction(lambda: timezone.now())
    date_to = None

    class Meta:
        model = Group


class TeamFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    type = FuzzyChoice(TeamType)

    group = SubFactory(GroupFactory)

    class Meta:
        model = Team


class RoleFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    # name_plural = SelfAttribute("name")

    order = Sequence(lambda n: n)

    class Meta:
        model = Role


class MemberFactory(DjangoModelFactory):
    user = SubFactory("user.tests.factories.UserFactory")
    team = SubFactory(TeamFactory)
    role = SubFactory(RoleFactory)

    date_from = LazyFunction(lambda: timezone.localdate())
    date_to = None

    class Meta:
        model = Member
