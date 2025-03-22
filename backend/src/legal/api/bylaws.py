from typing import List

from comunicat.enums import Module
from legal.models import Bylaws


def get_list(module: Module) -> List[Bylaws]:
    return list(
        Bylaws.objects.filter(
            module=module,
        ).order_by("-date")
    )
