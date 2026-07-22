import random

from factory import (
    Faker,
    LazyAttribute,
    LazyFunction,
    PostGenerationMethodCall,
    SelfAttribute,
    SubFactory,
)
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_string, fake_telephone
from user.enums import FamilyMemberRequestStatus, FamilyMemberRole, FamilyMemberStatus
from user.models import (
    Family,
    FamilyMember,
    FamilyMemberRequest,
    GoogleGroup,
    GoogleGroupModule,
    GoogleGroupUser,
    TowersUser,
    User,
    UserEmail,
)


class UserFactory(DjangoModelFactory):
    email = Faker("email")
    firstname = Faker("first_name")
    lastname = Faker("last_name")
    phone = LazyFunction(fake_telephone)

    password = PostGenerationMethodCall("set_password", "password")

    origin_module = FuzzyChoice(Module)

    is_active = True
    is_superuser = False
    is_staff = False

    email_verified = True

    class Meta:
        model = User


class UserEmailFactory(DjangoModelFactory):
    user = SubFactory(UserFactory)

    email = Faker("email")
    email_verified = True

    class Meta:
        model = UserEmail


class TowersUserFactory(DjangoModelFactory):
    user = SubFactory(UserFactory)

    alias = Faker("name")
    height_shoulders = LazyAttribute(lambda n: random.randint(100, 175))
    height_arms = LazyAttribute(lambda n: random.randint(150, 200))

    class Meta:
        model = TowersUser


class FamilyFactory(DjangoModelFactory):
    class Meta:
        model = Family


class FamilyMemberFactory(DjangoModelFactory):
    user = SubFactory(UserFactory)
    family = SubFactory(FamilyFactory)

    role = FuzzyChoice(FamilyMemberRole)
    status = FuzzyChoice(FamilyMemberStatus)

    class Meta:
        model = FamilyMember


class FamilyMemberRequestFactory(DjangoModelFactory):
    user_sender = SubFactory(UserFactory)
    email_receiver = SelfAttribute("user_sender.email")
    user_receiver = SubFactory(UserFactory)

    family = SubFactory(FamilyFactory)

    status = FuzzyChoice(FamilyMemberRequestStatus)

    class Meta:
        model = FamilyMemberRequest


class GoogleGroupFactory(DjangoModelFactory):
    name = Faker("name")
    external_id = LazyFunction(fake_string)

    is_primary = False

    google_integration = SubFactory(
        "integration.tests.factories.GoogleIntegrationFactory"
    )

    delete_on_expire = True

    class Meta:
        model = GoogleGroup


class GoogleGroupModuleFactory(DjangoModelFactory):
    group = SubFactory(GoogleGroupFactory)

    module = SelfAttribute("group.google_integration.module")

    team = SubFactory("legal.tests.factories.TeamFactory")
    role = SubFactory("legal.tests.factories.RoleFactory")

    require_module_domain = False
    require_membership = False
    exclude_active = False

    class Meta:
        model = GoogleGroupModule


class GoogleGroupUserFactory(DjangoModelFactory):
    group = SubFactory(GoogleGroupFactory)
    user = SubFactory(UserFactory)

    email = SelfAttribute("user.email")

    force_member = False

    class Meta:
        model = GoogleGroupUser
