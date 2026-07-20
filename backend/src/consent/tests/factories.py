from factory import SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from consent.enums import ConsentType
from consent.models import EntityConsent


class EntityConsentFactory(DjangoModelFactory):
    entity = SubFactory("payment.tests.factories.EntityFactory")

    type = FuzzyChoice(ConsentType)

    newsletter = SubFactory("notify.tests.factories.NewsletterFactory")
    google_group_user = SubFactory("user.tests.factories.GoogleGroupUserFactory")

    deleted_at = None

    class Meta:
        model = EntityConsent
