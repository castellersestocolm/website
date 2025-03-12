from django.conf import settings


def language_field_default():
    return {language_code: "" for language_code, __ in settings.LANGUAGES}
