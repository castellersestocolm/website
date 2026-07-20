from factory import SubFactory, SelfAttribute
from factory.django import DjangoModelFactory

from payment.models import Entity


class EntityFactory(DjangoModelFactory):
    email = SelfAttribute("user.email")
    firstname = SelfAttribute("user.firstname")
    lastname = SelfAttribute("user.lastname")
    phone = SelfAttribute("user.phone")

    user = SubFactory("user.tests.factories.UserFactory")

    class Meta:
        model = Entity
