import logging

from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from comunicat.enums import Module
from comunicat.utils.request import get_module_from_request
from user.models import User


class SessionMiddlewareDynamicDomain(MiddlewareMixin):
    def __init__(self, get_response):
        super().__init__(get_response)

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
        module = get_module_from_request(request=request)

        if getattr(request, "user"):
            request.user = (
                User.objects.filter(id=request.user.id)
                .with_permission_level(modules=[module] if module else None)
                .first()
            )

        return self.get_response(request)
