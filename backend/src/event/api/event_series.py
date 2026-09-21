from django.db.models import Prefetch, Q

from comunicat.enums import Module
from event.enums import EventStatus
from event.models import Event, EventModule, EventSeries


def get_list(  # noqa: C901
    module: Module,
    code: str | None = None,
) -> list[EventSeries]:
    event_series_filter = Q()

    if code:
        event_series_filter &= Q(code=code)

    return list(
        EventSeries.objects.filter(
            event_series_filter,
            Q(module__isnull=True) | Q(module=module),
        )
        .prefetch_related(
            Prefetch(
                "events",
                (
                    Event.objects.filter(
                        Q(module__isnull=True)
                        | Q(module=module)
                        | Q(modules__module=module),
                        status=EventStatus.PUBLISHED,
                    )
                    .select_related(
                        "location",
                    )
                    .prefetch_related(
                        Prefetch(
                            "modules",
                            (
                                EventModule.objects.select_related("team").order_by(
                                    "module", "team__type"
                                )
                            ),
                        ),
                    )
                    .with_module_information(module=module)
                    .order_by("time_from", "id")
                    .distinct("time_from", "id")
                ),
            ),
        )
        .order_by("code")
    )


def get(
    module: Module,
    code: str | None = None,
) -> Event | None:
    return (
        get_list(
            code=code,
            module=module,
        )
        + [None]
    )[0]
