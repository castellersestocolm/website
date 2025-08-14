from typing import List

from django.db.models import Prefetch, Q
from django.utils import timezone

from comunicat.enums import Module
from media.models import Release, ReleaseImage


def get_list(module: Module, slug: str | None = None) -> List[Release]:
    release_filter = Q()

    if slug:
        release_filter = Q(slug=slug)

    return list(
        Release.objects.filter(
            release_filter,
            module=module,
            date__lte=timezone.now(),
        )
        .prefetch_related(
            Prefetch("images", ReleaseImage.objects.order_by("order")),
        )
        .order_by("-date")
    )


def get(slug: str, module: Module) -> Release | None:
    release_objs = get_list(slug=slug, module=module)

    if not release_objs:
        return None

    return release_objs[0]
