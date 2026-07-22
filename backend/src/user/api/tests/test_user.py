import pytest
from django.test import TestCase

from conftest import NumOperationsMixin
from user.api import generate_alias
from user.tests.factories import TowersUserFactory, UserFactory


@pytest.mark.django_db
class TestUserGenerateAlias(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.towers_user_1_obj = TowersUserFactory(alias="name-1")
        cls.towers_user_2_obj = TowersUserFactory(alias="name-2")
        cls.towers_user_3_obj = TowersUserFactory(alias="surname-1")
        cls.towers_user_4_obj = TowersUserFactory(alias="name-2surname-1")

    def test_generate_alias__no_match(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-3", lastname="surname-1")

        alias = generate_alias(
            user_id=user_obj.id,
            firstname=user_obj.firstname,
            lastname=user_obj.lastname,
        )

        self.assertEqual(alias, "name-3")

    def test_generate_alias__match_firstname(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-1", lastname="surname-2")

        alias = generate_alias(
            user_id=user_obj.id,
            firstname=user_obj.firstname,
            lastname=user_obj.lastname,
        )

        self.assertEqual(alias, "surname-2")

    def test_generate_alias__match_firstname_and_lastname(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-1", lastname="surname-1")

        alias = generate_alias(
            user_id=user_obj.id,
            firstname=user_obj.firstname,
            lastname=user_obj.lastname,
        )

        self.assertEqual(alias, "name-1surname-1")

    def test_generate_alias__match_random(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-2", lastname="surname-1")

        alias = generate_alias(
            user_id=user_obj.id,
            firstname=user_obj.firstname,
            lastname=user_obj.lastname,
        )

        self.assertIn("name-2surname-1", alias)
        self.assertGreater(len(alias), 15)
