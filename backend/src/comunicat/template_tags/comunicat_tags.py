import importlib
from typing import List
from urllib.parse import urljoin

from django.conf import settings
from django.template.defaulttags import register
from django.utils import timezone, translation
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from djmoney.money import Money

from comunicat.enums import Module
from event.models import Registration, Event
from membership.models import Membership
from notify.consts import SETTINGS_BY_MODULE
from order.models import Order
from user.models import User


@register.simple_tag
def full_url(path: str):
    return urljoin(f"{settings.HTTP_PROTOCOL}://{settings.DOMAIN}/", path)


@register.simple_tag
def full_org_url(path: str):
    return urljoin(f"{settings.HTTP_PROTOCOL}://{settings.MODULE_ORG_DOMAIN}/", path)


@register.simple_tag
def full_towers_url(path: str):
    return urljoin(f"{settings.HTTP_PROTOCOL}://{settings.MODULE_TOWERS_DOMAIN}/", path)


@register.simple_tag
def full_static(path: str):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.DOMAIN}{settings.STATIC_URL}/", path
    )


@register.simple_tag
def full_org_static(path: str):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.MODULE_ORG_DOMAIN}{settings.STATIC_URL}/",
        path,
    )


@register.simple_tag
def full_towers_static(path: str):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.MODULE_TOWERS_DOMAIN}{settings.STATIC_URL}/",
        path,
    )


@register.simple_tag
def full_media(path: str):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.DOMAIN}{settings.MEDIA_URL}/", path
    )


@register.filter
def settings_value(name: str):
    return getattr(settings, name, "")


@register.filter
def module_settings_value(module: Module, name: str):
    return getattr(settings, f"MODULE_{Module(module).name}_{name}", "")


@register.filter
def date_is_future(date: timezone.datetime.date) -> bool:
    return date >= timezone.localdate()


@register.filter
def date_add_days(date: timezone.datetime.date, days: int) -> timezone.datetime.date:
    return date + timezone.timedelta(days=days)


@register.filter
def subtract(value, arg):
    return value - arg


@register.simple_tag
def registration_by_event_and_user(
    registration_objs: List[Registration], event_obj: Event, user_obj: User
):
    return (
        [
            registration_obj
            for registration_obj in registration_objs
            if registration_obj.event == event_obj and registration_obj.user == user_obj
        ]
        + [None]
    )[0]


@register.filter
def localise(text: dict[str]) -> str:
    locale = translation.get_language()
    return text.get(locale)


@register.filter
def order_amount(order_obj: Order) -> Money:
    return sum(
        [order_product_obj.amount for order_product_obj in order_obj.products.all()]
    )


@register.filter
def registrations_amount(registration_objs: list[Registration]) -> Money:
    return sum(
        [
            registration_obj.line.amount
            for registration_obj in registration_objs
            if registration_obj.line
        ]
    )


@register.filter
def membership_amount(membership_obj: Membership) -> Money:
    return sum(
        [
            membership_module_obj.amount
            for membership_module_obj in membership_obj.all_modules
        ]
    )


@register.filter
def membership_module_names(membership_obj: Membership) -> list[str]:
    return [
        SETTINGS_BY_MODULE[membership_module_obj.module]["name"]
        for membership_module_obj in membership_obj.all_modules
    ]


@register.filter
def format_money(amount: Money) -> str:
    return f"{'{:,}'.format(int(amount.amount)).replace(',', ' ')} {amount.currency}"


@register.filter
def format_enum(enum: str, value):
    enum_module = importlib.import_module(".".join(enum.split(".")[:-1]))
    enum_class = getattr(enum_module, enum.split(".")[-1])
    return enum_class(value).name


@register.filter
def format_text(text: str) -> str:
    return mark_safe(
        format_html("".join([f"<p>{text_line}</p>" for text_line in text.split("\n")]))
    )
