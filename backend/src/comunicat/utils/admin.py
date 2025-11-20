from django import forms

from django.conf import settings


FIELD_LOCALE = forms.ChoiceField(choices=settings.LANGUAGES)
