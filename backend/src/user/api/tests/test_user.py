import datetime

import pytest
from django.contrib.sessions.middleware import SessionMiddleware
from django.core import mail, signing
from django.test import RequestFactory, TestCase
from django.utils import timezone

from comunicat.enums import Module
from conftest import NumOperationsMixin
from consent.enums import ConsentType
from membership.enums import MembershipStatus
from membership.models import MembershipUser
from notify.enums import EmailStatus, EmailType
from notify.models import Email
from payment.models import Entity
from user.api import generate_alias, register, request_password, set_password, update
from user.enums import FamilyMemberRequestStatus, FamilyMemberRole, FamilyMemberStatus
from user.models import FamilyMember, FamilyMemberRequest, TowersUser
from user.tests.factories import (
    FamilyMemberFactory,
    FamilyMemberRequestFactory,
    TowersUserFactory,
    UserFactory,
)


@pytest.mark.django_db
class TestGenerateAlias(NumOperationsMixin, TestCase):
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
class TestRegister(NumOperationsMixin, TestCase):
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
                phone="+46700000002",
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
        self.assertEqual(user_obj.phone, "+46700000002")
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


@pytest.mark.django_db
class TestUpdate(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user_1_obj = UserFactory(
            firstname="name-1",
            lastname="surname-1",
            email="user-1@domain-test.org",
            phone="+46700000001",
            preferred_language="ca",
        )
        cls.user_2_obj = UserFactory(
            firstname="name-2",
            lastname="surname-2",
            email="user-2@domain-test.org",
            phone="+46700000002",
            preferred_language="ca",
            birthday=None,
        )

    def test_update__registration_not_finished(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=4, num_inserts=1, num_updates=1
        ):
            user_obj = update(
                user_id=self.user_1_obj.id,
                firstname="name-3",
                lastname="surname-3",
                phone="+46700000003",
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
            )

        self.assertEqual(user_obj.firstname, "name-1")
        self.assertEqual(user_obj.lastname, "surname-1")
        self.assertEqual(user_obj.phone, "+46700000001")
        self.assertEqual(user_obj.preferred_language, "en")

        has_email = Email.objects.filter(entity__user=user_obj).exists()

        self.assertFalse(has_email)

        self.assertEqual(len(mail.outbox), 0)

    def test_update__registration_finished(self, *args, **kwargs):
        with self.assertNumOperations(
            num=0, num_selects=11, num_inserts=3, num_updates=1
        ):
            user_obj = update(
                user_id=self.user_2_obj.id,
                firstname="name-3",
                lastname="surname-3",
                phone="+46700000003",
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
            )

        self.assertEqual(user_obj.firstname, "name-3")
        self.assertEqual(user_obj.lastname, "surname-3")
        self.assertEqual(user_obj.phone, "+46700000003")
        self.assertEqual(user_obj.preferred_language, "en")

        towers_user_obj = TowersUser.objects.get(user=user_obj)

        self.assertEqual(towers_user_obj.alias, "name-3")
        self.assertEqual(towers_user_obj.height_shoulders, 150)
        self.assertEqual(towers_user_obj.height_arms, 200)

        email_obj = Email.objects.get(entity__user=user_obj)

        self.assertEqual(email_obj.type, EmailType.WELCOME)
        self.assertEqual(email_obj.status, EmailStatus.SENT)
        self.assertEqual(email_obj.module, Module.ORG)
        self.assertEqual(email_obj.locale, "en")
        self.assertIn("Welcome to", email_obj.subject)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [user_obj.email])
        self.assertEqual(mail.outbox[0].subject, email_obj.subject)


@pytest.mark.django_db
class TestPassword(NumOperationsMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user_1_obj = UserFactory(
            email="user-1@domain-test.org", preferred_language="en"
        )
        cls.user_2_obj = UserFactory(email="user-2@domain-test.org")

    def test_request_password(self, *args, **kwargs):
        with self.assertNumOperations(num=0, num_selects=8, num_inserts=2):
            request_password(email=self.user_1_obj.email, module=Module.ORG)

        email_obj = Email.objects.get(entity__user=self.user_1_obj)

        self.assertEqual(email_obj.type, EmailType.PASSWORD)
        self.assertEqual(email_obj.status, EmailStatus.SENT)
        self.assertEqual(email_obj.module, Module.ORG)
        self.assertEqual(email_obj.locale, "en")
        self.assertEqual(email_obj.subject, "Reset your password to login")

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user_1_obj.email])
        self.assertEqual(mail.outbox[0].subject, email_obj.subject)

    def test_set_password(self, *args, **kwargs):
        token = signing.dumps(
            {
                "user_id": str(self.user_2_obj.id),
                "updated_at": timezone.localtime().isoformat(),
            },
            salt="forgot-password",
        )

        request = RequestFactory().get("/")
        middleware = SessionMiddleware(get_response=lambda r: None)
        middleware.process_request(request)

        with self.assertNumOperations(num=0, num_selects=2, num_updates=2):
            set_password(
                token=token, password="password", module=Module.ORG, request=request
            )

        self.user_2_obj.refresh_from_db()

        self.assertTrue(self.user_2_obj.check_password("password"))
