import re
from decimal import Decimal
from typing import Any

from django import forms

from django.conf import settings
from django.forms import Widget

from django.utils.translation import gettext_lazy as _

FIELD_LOCALE = lambda **kwargs: forms.ChoiceField(choices=settings.LANGUAGES, **kwargs)


class DynamicColumn:
    def __init__(self, field: str):
        self.field = field
        self.__name__ = field

    def __call__(self, widget: Widget) -> str:
        return getattr(widget, self.field)


def string_or_enum(element, key: str | None = "", indentation: int = 0):
    return f"<p style='margin-left: {10 * indentation}px'>{element}</p>"


def beautify_element(
    element: Any,
    key: str | None = "",
    indentation: int = 0,
    exclude: list | None = None,
):
    if isinstance(element, dict):
        return beautify_dict(
            data=element, key=key, indentation=indentation + 1, exclude=exclude
        )
    elif isinstance(element, list):
        return beautify_list(
            data=element, key=key, indentation=indentation + 1, exclude=exclude
        )
    elif isinstance(element, bool):
        return f"<p style='margin-left: {10 * indentation}px'>{_('Yes') if element else _('No')}</p>"

    return string_or_enum(element=element, key=key, indentation=indentation)


def beautify_list(
    data: list,
    key: str | None = None,
    indentation: int = 0,
    exclude: list | None = None,
):
    data_str = ""
    for element in data:
        data_str += beautify_element(
            element=element, key=key, indentation=indentation, exclude=exclude
        )
    return data_str


def beautify_dict(
    data: dict, key: str | None = "", indentation: int = 0, exclude: list | None = None
):
    data_str = ""
    if exclude is None:
        exclude = []
    for key, element in data.items():
        if key not in exclude:
            data_str += f"<p style='margin-left: {10 * indentation}px'>{key.replace('_', ' ').capitalize()}</p>"
            data_str += beautify_element(
                element=element, key=key, indentation=indentation + 1, exclude=exclude
            )
    return data_str
