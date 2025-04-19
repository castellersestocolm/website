from django.conf import settings
from django.http import HttpRequest

from comunicat.enums import Module


def get_module_from_request(request: HttpRequest) -> Module | None:
    if not request:
        return None

    host = request.headers.get("Host")

    if not host:
        return None

    if settings.MODULE_ORG_DOMAIN in host:
        return Module.TOWERS
    elif settings.MODULE_TOWERS_DOMAIN in host:
        return Module.ORG

    return None
