import random
import string

from django.conf import settings
from factory import Faker


def fake_telephone(*args, **kwargs):
    return f"+4670{''.join(random.choices(string.digits, k=7))}"


def fake_string(*args, length: int = 10, **kwargs):
    return "".join(random.choices(string.ascii_letters, k=length))


def fake_title(*args, **kwargs):
    return {language_code: Faker("name") for language_code, __ in settings.LANGUAGES}


def fake_authorized_user_info(*args, **kwargs):
    return {
        "refresh_token": "".join(
            random.choices(string.digits + string.ascii_letters, k=20)
        ),
        "client_id": "".join(random.choices(string.digits, k=10)),
        "client_secret": "".join(random.choices(string.digits, k=10)),
    }
