from django.conf import settings
from django.utils import translation

from django.utils.translation import gettext_lazy as _


def get_translated_string(text: str) -> dict[str, str]:
    translated_dict = {}
    for language_code, __ in settings.LANGUAGES:
        with translation.override(language_code):
            translated_dict[language_code] = str(_(text))
    return translated_dict
