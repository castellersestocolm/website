import pytest
from django.test import TestCase
from djmoney.money import Money

from comunicat.enums import Module
from conftest import NumOperationsMixin
from event.enums import EventType, RegistrationStatus
from event.utils.event import get_event_title, get_registration_initial_status
from legal.enums import TeamType


@pytest.mark.django_db
class TestGetRegistrationInitialStatus(NumOperationsMixin, TestCase):
    def test_get_registration_initial_status(self, *args, **kwargs):
        with self.assertNumOperations(num=0):
            registration_status = get_registration_initial_status(require_approve=False)

        self.assertEqual(registration_status, RegistrationStatus.ACTIVE)

        with self.assertNumOperations(num=0):
            registration_status = get_registration_initial_status(
                require_approve=True, amount=Money(100, "SEK")
            )

        self.assertEqual(registration_status, RegistrationStatus.REQUESTED)

        with self.assertNumOperations(num=0):
            registration_status = get_registration_initial_status(
                require_approve=True, amount=Money(0, "SEK")
            )

        self.assertEqual(registration_status, RegistrationStatus.ACTIVE)


@pytest.mark.django_db
class TestGetEventTitle(NumOperationsMixin, TestCase):
    def test_get_event_title(self, *args, **kwargs):
        event_title_base = {"en": "Event title"}

        with self.assertNumOperations(num=0):
            event_title = get_event_title(
                event_title=event_title_base,
                event_type=EventType.REHEARSAL,
            )

        self.assertEqual(event_title, event_title_base)

        with self.assertNumOperations(num=0):
            event_title = get_event_title(
                event_title=event_title_base,
                event_type=EventType.REHEARSAL,
                modules=[(Module.ORG, None)],
            )

        self.assertEqual(event_title, event_title_base)

        with self.assertNumOperations(num=0):
            event_title = get_event_title(
                event_title=event_title_base,
                event_type=EventType.REHEARSAL,
                modules=[(Module.TOWERS, None)],
            )

        self.assertEqual(event_title["en"], "Rehearsal")

        with self.assertNumOperations(num=0):
            event_title = get_event_title(
                event_title=event_title_base,
                event_type=EventType.REHEARSAL,
                modules=[(Module.TOWERS, TeamType.MUSICIANS)],
            )

        self.assertEqual(event_title["en"], "Musicians rehearsal")

        with self.assertNumOperations(num=0):
            event_title = get_event_title(
                event_title=event_title_base,
                event_type=EventType.REHEARSAL,
                modules=[(Module.TOWERS, None), (Module.TOWERS, TeamType.MUSICIANS)],
            )

        self.assertEqual(event_title["en"], "Rehearsal with musicians")
