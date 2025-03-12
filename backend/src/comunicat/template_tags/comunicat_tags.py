from urllib.parse import urljoin

from django.conf import settings
from django.template.defaulttags import register
from django.urls import reverse
from django.utils import timezone


@register.simple_tag
def full_url(path):
    return urljoin(f"{settings.HTTP_PROTOCOL}://{settings.DOMAIN}/", path)


@register.simple_tag
def full_org_url(path):
    return urljoin(f"{settings.HTTP_PROTOCOL}://{settings.MODULE_ORG_DOMAIN}/", path)


@register.simple_tag
def full_towers_url(path):
    return urljoin(f"{settings.HTTP_PROTOCOL}://{settings.MODULE_TOWERS_DOMAIN}/", path)


@register.simple_tag
def full_static(path):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.DOMAIN}{settings.STATIC_URL}/", path
    )


@register.simple_tag
def full_org_static(path):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.MODULE_ORG_DOMAIN}{settings.STATIC_URL}/",
        path,
    )


@register.simple_tag
def full_towers_static(path):
    return urljoin(
        f"{settings.HTTP_PROTOCOL}://{settings.MODULE_TOWERS_DOMAIN}{settings.STATIC_URL}/",
        path,
    )


@register.filter
def settings_value(name):
    return getattr(settings, name, "")


@register.filter
def date_is_future(date: timezone.datetime.date):
    return date >= timezone.localdate()


@register.filter
def subtract(value, arg):
    return value - arg
