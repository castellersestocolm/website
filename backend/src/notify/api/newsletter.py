from typing import List

from comunicat.enums import Module
from legal.models import Team
from notify.models import Newsletter


def get_list(module: Module) -> List[Team]:
    return list(
        Newsletter.objects.filter(
            module=module,
        )
        .with_name()
        .with_description()
        .order_by("name_locale")
    )
