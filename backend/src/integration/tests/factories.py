from factory import LazyFunction
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.enums import Module
from comunicat.utils.factories import fake_authorized_user_info
from integration.models import GoogleIntegration


class GoogleIntegrationFactory(DjangoModelFactory):
    module = FuzzyChoice(Module)

    authorized_user_info = LazyFunction(fake_authorized_user_info)

    class Meta:
        model = GoogleIntegration
