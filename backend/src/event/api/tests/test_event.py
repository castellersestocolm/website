import uuid

import pytest
from django.test import TestCase

from conftest import NumOperationsMixin
from event.api import (
    get_event_data_by_event_registration_token,
    get_event_registration_token,
)


@pytest.mark.django_db
class TestEventRegistrationToken(NumOperationsMixin, TestCase):
    def test_get_event_registration_token(self, *args, **kwargs):
        event_id = uuid.uuid4()

        with self.assertNumOperations(num=0):
            token = get_event_registration_token(event_id=event_id)

        self.assertIsNotNone(token)

        with self.assertNumOperations(num=0):
            token = get_event_registration_token(event_id=event_id, signup_is_open=True)

        self.assertIsNotNone(token)

    def test_get_event_data_by_event_registration_token(self, *args, **kwargs):
        event_id = uuid.uuid4()

        token = get_event_registration_token(event_id=event_id)

        with self.assertNumOperations(num=0):
            data = get_event_data_by_event_registration_token(token=token)

        self.assertIsNotNone(data)
        self.assertEqual(data["event_id"], str(event_id))
        self.assertNotIn("signup_is_open", data)

        token = get_event_registration_token(event_id=event_id, signup_is_open=True)

        with self.assertNumOperations(num=0):
            data = get_event_data_by_event_registration_token(token=token)

        self.assertIsNotNone(data)
        self.assertEqual(data["event_id"], str(event_id))
        self.assertEqual(data["signup_is_open"], True)
