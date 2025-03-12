import calendar
import datetime

from django.utils import timezone

from django.conf import settings

from comunicat.enums import Module
from membership.consts import (
    MEMBERSHIP_LENGTHS,
    MEMBERSHIP_BY_MODULE,
    MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS,
)


def get_membership_length(member_count: int) -> int | None:
    membership_lengths = sorted(
        [(members, length) for members, length in MEMBERSHIP_LENGTHS.items()],
        key=lambda ml: -ml[0],
    )
    for members, length in membership_lengths:
        if member_count >= members:
            return length

    return None


def get_membership_amount(member_count: int, module: Module) -> int | None:
    membership_by_module = sorted(
        [(members, length) for members, length in MEMBERSHIP_BY_MODULE[module].items()],
        key=lambda ml: -ml[0],
    )
    for members, amount in membership_by_module:
        if member_count >= members:
            return amount

    return None


def get_membership_account(member_count: int, module: Module) -> int | None:
    membership_account_by_module = sorted(
        [
            (members, length)
            for members, length in MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS[
                module
            ].items()
        ],
        key=lambda ml: -ml[0],
    )
    for members, account_code in membership_account_by_module:
        if member_count >= members:
            return account_code

    return None


def get_membership_date_to(months: int) -> datetime.date | None:
    today = timezone.localdate()

    # Add one month of grace period (memberships get to cover +1 month)
    grace_year = today.year + (today.month + months) // 12
    grace_month = (today.month + months) % 12 + 1
    grace_day = min(today.day, calendar.monthrange(grace_year, grace_month)[1])
    date_to = today.replace(
        day=grace_day,
        month=grace_month,
        year=grace_year,
    )

    future_membership_dates = [
        today.replace(day=day, month=month, year=year) - timezone.timedelta(days=1)
        for year in (today.year, today.year + 1, today.year + 2)
        for day, month in settings.MODULE_ALL_MEMBERSHIP_START_DATES
    ]

    date_found = False
    for i, future_membership_date in enumerate(future_membership_dates):
        if (future_membership_date - date_to).total_seconds() > 0:
            date_to = future_membership_dates[max(0, i - 1)]
            date_found = True
            break

    if not date_found:
        return None

    return date_to
