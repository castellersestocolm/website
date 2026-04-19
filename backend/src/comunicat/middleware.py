import logging
from urllib.parse import urlparse

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from comunicat.enums import Module
from user.models import User


class SessionMiddlewareDynamicDomain(MiddlewareMixin):
    def process_request(self, request):
        header_origin = request.headers.get("Origin")

        if header_origin:
            domain = urlparse(header_origin).netloc

            if settings.MODULE_ORG_DOMAIN in domain:
                request.module = Module.ORG
            else:
                request.module = Module.TOWERS
        else:
            request.module = Module.ORG

    def process_response(self, request, response):
        for cookie in ("SESSION", "CSRF"):
            cookie_name = getattr(settings, f"{cookie}_COOKIE_NAME")
            if cookie_name is not None and cookie_name in response.cookies:
                try:
                    response.cookies[cookie_name][
                        "domain"
                    ] = f".{getattr(settings, f"MODULE_{Module(request.module).name}_DOMAIN") if hasattr(request, "module") else getattr(settings, f"{cookie}_COOKIE_DOMAIN") or settings.DOMAIN}"
                except Exception as exc:
                    logging.error(
                        f"Crash updating domain for cookie {cookie_name} dynamically. Skipped. Error: {exc}"
                    )

        return response


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
