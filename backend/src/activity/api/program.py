from typing import List

from django.db.models import Prefetch, Q
from django.utils import timezone

from activity.models import Program, ProgramCourse, ProgramCoursePrice
from comunicat.enums import Module
from event.enums import EventStatus
from event.models import Event


# TODO: Perhaps allow programs to be multi-module
def get_list(module: Module) -> List[Program]:
    return list(
        Program.objects.filter(
            module=module,
        )
        .prefetch_related(
            Prefetch(
                "courses",
                ProgramCourse.objects.prefetch_related(
                    Prefetch(
                        "prices",
                        ProgramCoursePrice.objects.order_by("amount"),
                    ),
                    Prefetch(
                        "events",
                        Event.objects.filter(status=EventStatus.PUBLISHED).order_by(
                            "time_from"
                        ),
                    ),
                ).order_by("-date_from", "-date_to"),
            )
        )
        .with_name()
        .order_by("name_locale")
    )
