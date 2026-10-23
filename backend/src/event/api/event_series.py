import datetime

from django.db.models import Prefetch, Q

from comunicat.enums import Module
from event.enums import EventStatus
from event.models import Event, EventModule, EventSeries


def get_list(  # noqa: C901
    module: Module,
    code: str | None = None,
    events_date_from: datetime.date | None = None,
    events_date_to: datetime.date | None = None,
    events_order_by: list[str] | None = None,
) -> list[EventSeries]:
    event_series_filter = Q()

    if code:
        event_series_filter &= Q(code=code)

    events_filter = Q()

    # TODO: This can lead to timezone issues close to midnight
    if events_date_from is not None:
        events_filter &= Q(time_from__date__gte=events_date_from)

    # TODO: This can lead to timezone issues close to midnight
    if events_date_to is not None:
        events_filter &= Q(time_from__date__lte=events_date_to)

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
                        events_filter,
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
                    .order_by(*(events_order_by or []), "time_from", "id")
                    .distinct(*(events_order_by or []), "time_from", "id")
                ),
            ),
        )
        .order_by("code")
    )


def get(
    module: Module,
    code: str | None = None,
    events_date_from: datetime.date | None = None,
    events_date_to: datetime.date | None = None,
    events_order_by: list[str] | None = None,
) -> Event | None:
    return (
        get_list(
            code=code,
            module=module,
            events_date_from=events_date_from,
            events_date_to=events_date_to,
            events_order_by=events_order_by,
        )
        + [None]
    )[0]
