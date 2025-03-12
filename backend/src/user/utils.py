import datetime

from django.utils import timezone
from django.conf import settings


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
