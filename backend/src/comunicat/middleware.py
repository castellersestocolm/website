import logging
from urllib.parse import urlparse

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from comunicat.enums import Module
from user.models import User


class SessionMiddlewareDynamicDomain(MiddlewareMixin):
    def __init__(self, get_response):
        super().__init__(get_response)

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
        if settings.SESSION_COOKIE_NAME in response.cookies:
            try:
                domain_curr = response.cookies[settings.SESSION_COOKIE_NAME]["domain"]

                request_domain = "." + ".".join(
                    request.get_host().split(":")[0].split(".")[-2:]
                )

                if request_domain in settings.SESSION_COOKIE_DOMAIN_DYNAMIC:
                    if domain_curr != request_domain:
                        response.cookies[settings.SESSION_COOKIE_NAME][
                            "domain"
                        ] = request_domain
            except Exception as exc:
                logging.error(
                    f"crash updating domain dynamically. Skipped. Error: {exc}"
                )
        if settings.CSRF_COOKIE_NAME in response.cookies:
            try:
                domain_curr = response.cookies[settings.CSRF_COOKIE_NAME]["domain"]

                request_domain = "." + ".".join(
                    request.get_host().split(":")[0].split(".")[-2:]
                )

                if request_domain in settings.CSRF_COOKIE_DOMAIN_DYNAMIC:
                    if domain_curr != request_domain:
                        response.cookies[settings.CSRF_COOKIE_NAME][
                            "domain"
                        ] = request_domain
            except Exception as exc:
                logging.error(
                    f"crash updating domain dynamically. Skipped. Error: {exc}"
                )

        return response


class UserMiddlewarePermissionLevel:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if getattr(request, "user") and request.user.is_authenticated:
            request.user = (
                User.objects.filter(id=request.user.id)
                # TODO: Get the right module
                .with_permission_level(modules=[request.module])
                # .with_permission_level(modules=[module] if module else None)
                .first()
            )

        return self.get_response(request)
