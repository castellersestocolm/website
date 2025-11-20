from django import forms

from django.conf import settings
from django.forms import Widget

FIELD_LOCALE = forms.ChoiceField(choices=settings.LANGUAGES)


class DynamicColumn:
    def __init__(self, field: str):
        self.field = field
        self.__name__ = field

    def __call__(self, widget: Widget) -> str:
        return getattr(widget, self.field)
