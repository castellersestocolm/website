from typing import Any

from django.conf import settings


def language_field_default(value: Any | None = None):
    return {
        language_code: value if value is not None else ""
        for language_code, __ in settings.LANGUAGES
    }
