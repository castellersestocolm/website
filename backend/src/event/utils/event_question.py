from typing import Any

from django.utils import translation
from django.utils.translation import gettext_lazy as _

from event.enums import EventQuestionType
from event.models import EventQuestion


def get_event_question_answer(event_question_obj: EventQuestion, value: Any) -> str:
    if value is None:
        return ""

    if event_question_obj.type == EventQuestionType.BOOLEAN:
        return str(_("Yes")) if value else str(_("No"))
    elif event_question_obj.type == EventQuestionType.CHOICE:
        event_answers = event_question_obj.data.get("choices", {})
        event_answers_locale = (
            event_answers.get(translation.get_language())
            or list(event_answers.values())[0]
        )
        if isinstance(event_answers_locale, list):
            return (
                event_answers_locale[value] if value < len(event_answers_locale) else ""
            )
        return event_answers_locale.get(value, "")

    return str(value)
