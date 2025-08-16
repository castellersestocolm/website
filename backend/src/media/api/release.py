from typing import List

from django.db.models import Prefetch, Q
from django.utils import timezone

from comunicat.enums import Module
from media.models import Release, ReleaseImage


def get_list(
    module: Module, slug: str | None = None, only_published: bool = True
) -> List[Release]:
    release_filter = Q()

    if slug:
        release_filter &= Q(slug=slug)

    if only_published:
        release_filter &= Q(date__lte=timezone.now())

    return list(
        Release.objects.filter(
            release_filter,
            module=module,
        )
        .prefetch_related(
            Prefetch("images", ReleaseImage.objects.order_by("order")),
        )
        .order_by("-date")
    )


def get(slug: str, module: Module, only_published: bool = True) -> Release | None:
    release_objs = get_list(slug=slug, module=module, only_published=only_published)

    if not release_objs:
        return None

    return release_objs[0]
