from django.db.models import Q

from theme.enums import IconType
from theme.models import Icon


def get_list(
    filter_types: list[IconType] | None = None,
) -> list[Icon]:
    icon_filter = Q()

    if filter_types is not None:
        icon_filter &= Q(type__in=filter_types)

    return list(
        Icon.objects.filter(icon_filter)
        .order_by("type", "code")
        .distinct("type", "code")
    )
