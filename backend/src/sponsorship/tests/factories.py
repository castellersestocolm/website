import random

from django.utils import timezone
from djmoney.money import Money
from factory import LazyAttribute, LazyFunction, Sequence, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_string, fake_title
from sponsorship.enums import (
    EntityTierStatus,
    RewardType,
    SponsorshipStatus,
    SponsorshipType,
)
from sponsorship.models import (
    EntityTier,
    EntityTierReward,
    Reward,
    RewardGroup,
    Sponsorship,
    Tier,
    TierPrice,
)


class SponsorshipFactory(DjangoModelFactory):
    name = LazyFunction(fake_title)
    description = LazyFunction(fake_title)

    code = LazyFunction(lambda: fake_string(length=10))

    type = FuzzyChoice(SponsorshipType)
    status = FuzzyChoice(SponsorshipStatus)
    module = FuzzyChoice(Module)

    date_from = LazyFunction(lambda: timezone.localdate())
    date_to = LazyFunction(lambda: timezone.localdate() + timezone.timedelta(days=30))

    event = SubFactory("event.tests.factories.EventFactory")

    class Meta:
        model = Sponsorship


class TierFactory(DjangoModelFactory):
    sponsorship = SubFactory(SponsorshipFactory)

    name = LazyFunction(fake_title)
    description = LazyFunction(fake_title)

    length_days = LazyAttribute(lambda n: random.randint(0, 365))
    length_months = LazyAttribute(lambda n: random.randint(0, 12))
    length_years = LazyAttribute(lambda n: random.randint(0, 1))

    order = Sequence(lambda n: n)

    # theme

    class Meta:
        model = Tier


class TierPriceFactory(DjangoModelFactory):
    tier = SubFactory(TierFactory)

    module = FuzzyChoice(Module)

    amount = LazyAttribute(lambda n: Money(random.randint(100, 500), "SEK"))

    class Meta:
        model = TierPrice


class RewardFactory(DjangoModelFactory):
    type = FuzzyChoice(RewardType)

    name = LazyFunction(fake_title)
    description = LazyFunction(fake_title)

    # icon

    product = SubFactory("product.tests.factories.ProductFactory")
    newsletter = SubFactory("notify.tests.factories.NewsletterFactory")

    class Meta:
        model = Reward


class RewardGroupFactory(DjangoModelFactory):
    tier = SubFactory(TierFactory)

    min_rewards = LazyAttribute(lambda n: random.randint(0, 1))
    max_rewards = LazyAttribute(lambda n: random.randint(1, 2))

    order = Sequence(lambda n: n)

    # rewards

    class Meta:
        model = RewardGroup


class EntityTierFactory(DjangoModelFactory):
    entity = SubFactory("payment.tests.factories.EntityFactory")

    tier = SubFactory(TierFactory)

    status = FuzzyChoice(EntityTierStatus)

    date_from = LazyFunction(lambda: timezone.localdate())
    date_to = LazyFunction(lambda: timezone.localdate() + timezone.timedelta(days=30))

    price = SubFactory(TierPriceFactory)

    is_public = True

    class Meta:
        model = EntityTier


class EntityTierRewardFactory(DjangoModelFactory):
    entity_tier = SubFactory(EntityTierFactory)

    reward = SubFactory(RewardFactory)

    class Meta:
        model = EntityTierReward
