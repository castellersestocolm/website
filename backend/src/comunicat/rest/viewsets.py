from urllib.parse import urlparse

from rest_framework.viewsets import ViewSet

from comunicat.enums import Module

from django.conf import settings


class ComuniCatViewSet(ViewSet):
    module: Module | None = None

    def initial(self, request, *args, **kwargs):
        header_origin = request.headers.get("Origin")

        if header_origin:
            domain = urlparse(header_origin).netloc

            if settings.MODULE_ORG_DOMAIN in domain:
                self.module = Module.ORG
            else:
                self.module = Module.TOWERS
        else:
            self.module = Module.ORG

        return super().initial(request=request, *args, **kwargs)
