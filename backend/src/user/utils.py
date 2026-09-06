import datetime
import random
import string

from django.conf import settings
from django.utils import timezone


def is_over_minimum_age(date: datetime.date) -> bool:
    date_today = timezone.localdate()
    date_minimum_age = datetime.date(
        date_today.year - settings.MODULE_ALL_USER_MINIMUM_AGE,
        date_today.month,
        date_today.day,
    )

    return date <= date_minimum_age


def get_default_consent_pictures(birthday: datetime.date) -> bool:
    return is_over_minimum_age(date=birthday)


def generate_membership_number() -> str:
    from user.models import User

    membership_numbers = User.objects.values_list("membership_number", flat=True)

    membership_number = "".join(random.choices(string.digits, k=12))
    while membership_number in membership_numbers:
        membership_number = "".join(random.choices(string.digits, k=12))

    return membership_number
