from django.db.models import Prefetch

from comunicat.enums import Module
from data.models import Country, Region


def get_list(module: Module) -> list[Country]:
    return list(
        Country.objects.with_name()
        .select_related("zone")
        .prefetch_related(
            Prefetch("regions", Region.objects.with_name().order_by("name_locale"))
        )
        .order_by("-is_starred", "name_locale")
    )
