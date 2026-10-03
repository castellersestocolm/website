from urllib.parse import urlparse

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from comunicat.enums import Module
from user.models import User


class SessionMiddlewareDynamicDomain(MiddlewareMixin):
    def __call__(self, request):
        header_origin = request.headers.get("Origin")

        if header_origin:
            domain = urlparse(header_origin).netloc

            if settings.MODULE_ORG_DOMAIN in domain:
                request.module = Module.ORG
            else:
                request.module = Module.TOWERS
        else:
            request.module = Module.ORG

        return super().__call__(request=request)


class UserMiddlewarePermissionLevel(MiddlewareMixin):
    def __call__(self, request):
        if getattr(request, "user") and request.user.is_authenticated:
            request.user = (
                User.objects.filter(id=request.user.id)
                # TODO: Get the right module
                .with_permission_level(modules=[request.module])
                # .with_permission_level(modules=[module] if module else None)
                .first()
            )

        return super().__call__(request=request)
