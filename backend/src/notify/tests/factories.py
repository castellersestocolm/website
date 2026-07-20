from factory import LazyFunction, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_title
from notify.enums import NewsletterType
from notify.models import Newsletter


class NewsletterFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    # description = LazyFunction(fake_title)

    module = FuzzyChoice(Module)
    type = FuzzyChoice(NewsletterType)

    google_group = SubFactory("user.tests.factories.GroupFactory")

    class Meta:
        model = Newsletter
