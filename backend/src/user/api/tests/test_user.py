import datetime

import pytest
from django.core import mail
from django.test import TestCase
from django.utils import timezone

from comunicat.enums import Module
from conftest import NumOperationsMixin
from consent.enums import ConsentType
from membership.enums import MembershipStatus
from membership.models import MembershipUser
from notify.enums import EmailStatus, EmailType
from notify.models import Email
from payment.models import Entity
from user.api import generate_alias, register
from user.enums import FamilyMemberRequestStatus, FamilyMemberRole, FamilyMemberStatus
from user.models import FamilyMember, FamilyMemberRequest, TowersUser
from user.tests.factories import (
    FamilyMemberFactory,
    FamilyMemberRequestFactory,
    TowersUserFactory,
    UserFactory,
)


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

        with self.assertNumOperations(num=0, num_selects=2):
            alias = generate_alias(
                user_id=user_obj.id,
                firstname=user_obj.firstname,
                lastname=user_obj.lastname,
            )

        self.assertEqual(alias, "name-3")

    def test_generate_alias__match_firstname(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-1", lastname="surname-2")

        with self.assertNumOperations(num=0, num_selects=2):
            alias = generate_alias(
                user_id=user_obj.id,
                firstname=user_obj.firstname,
                lastname=user_obj.lastname,
            )

        self.assertEqual(alias, "surname-2")

    def test_generate_alias__match_firstname_and_lastname(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-1", lastname="surname-1")

        with self.assertNumOperations(num=0, num_selects=2):
            alias = generate_alias(
                user_id=user_obj.id,
                firstname=user_obj.firstname,
                lastname=user_obj.lastname,
            )

        self.assertEqual(alias, "name-1surname-1")

    def test_generate_alias__match_random(self, *args, **kwargs):
        user_obj = UserFactory(firstname="name-2", lastname="surname-1")

        with self.assertNumOperations(num=0, num_selects=2):
            alias = generate_alias(
                user_id=user_obj.id,
                firstname=user_obj.firstname,
                lastname=user_obj.lastname,
            )

        self.assertIn("name-2surname-1", alias)
        self.assertGreater(len(alias), 15)


@pytest.mark.django_db
class TestUserRegister(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user_1_obj = UserFactory(email="user-1@domain-test.org")
        cls.family_member_user_1_obj = FamilyMemberFactory(
            user=cls.user_1_obj,
            role=FamilyMemberRole.MANAGER,
            status=FamilyMemberStatus.ACTIVE,
        )
        cls.family_member_request_user_1_obj = FamilyMemberRequestFactory(
            user_receiver=None,
            email_receiver="user-2@domain-test.org",
            user_sender=cls.user_1_obj,
            family=cls.family_member_user_1_obj.family,
            status=FamilyMemberRequestStatus.REQUESTED,
        )

    def test_register(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=27, num_inserts=13, num_updates=1
        ):
            user_obj = register(
                firstname="name-2",
                lastname="surname-2",
                email="user-2@domain-test.org",
                phone="+46700000000",
                password="password",
                birthday=datetime.date(1970, 1, 1),
                consent_pictures=True,
                module=Module.ORG,
                towers={
                    "height_shoulders": 150,
                    "height_arms": 200,
                },
                organisation=None,
                consent_types=[
                    ConsentType.GENERAL,
                    ConsentType.MEDIA,
                    ConsentType.COMMUNICATION,
                    ConsentType.HEALTH,
                ],
                preferred_language="en",
                with_family=True,
                with_membership=True,
                with_notify=True,
            )

        self.assertEqual(user_obj.firstname, "name-2")
        self.assertEqual(user_obj.lastname, "surname-2")
        self.assertEqual(user_obj.email, "user-2@domain-test.org")
        self.assertEqual(user_obj.phone, "+46700000000")
        self.assertTrue(user_obj.check_password("password"))
        self.assertEqual(user_obj.birthday, datetime.date(1970, 1, 1))
        self.assertTrue(user_obj.consent_pictures)
        self.assertEqual(user_obj.preferred_language, "en")
        self.assertEqual(user_obj.origin_module, Module.ORG)

        entity_obj = Entity.objects.get(user=user_obj)

        self.assertEqual(entity_obj.firstname, user_obj.firstname)
        self.assertEqual(entity_obj.lastname, user_obj.lastname)
        self.assertEqual(entity_obj.email, user_obj.email)
        self.assertEqual(entity_obj.phone, user_obj.phone)

        towers_user_obj = TowersUser.objects.get(user=user_obj)

        self.assertEqual(towers_user_obj.alias, "name-2")
        self.assertEqual(towers_user_obj.height_shoulders, 150)
        self.assertEqual(towers_user_obj.height_arms, 200)

        family_member_obj = FamilyMember.objects.get(user=user_obj)

        self.assertEqual(family_member_obj.role, FamilyMemberRole.MANAGER)
        self.assertEqual(family_member_obj.status, FamilyMemberStatus.ACTIVE)

        family_member_request_obj = FamilyMemberRequest.objects.get(
            email_receiver="user-2@domain-test.org"
        )

        self.assertEqual(family_member_request_obj.user_receiver, user_obj)

        membership_user_obj = MembershipUser.objects.get(user=user_obj)

        self.assertEqual(membership_user_obj.family, family_member_obj.family)
        self.assertEqual(
            membership_user_obj.membership.status, MembershipStatus.REQUESTED
        )
        self.assertEqual(membership_user_obj.membership.date_from, timezone.localdate())
        self.assertIsNone(membership_user_obj.membership.date_end)
        self.assertIsNone(membership_user_obj.membership.previous)

        email_obj = Email.objects.get(entity__user=user_obj)

        self.assertEqual(email_obj.type, EmailType.REGISTER)
        self.assertEqual(email_obj.status, EmailStatus.SENT)
        self.assertEqual(email_obj.module, Module.ORG)
        self.assertEqual(email_obj.locale, "en")
        self.assertEqual(
            email_obj.subject, "Confirm your email to finish your registration"
        )
        self.assertIn("token", email_obj.context)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [user_obj.email])
        self.assertEqual(mail.outbox[0].subject, email_obj.subject)
