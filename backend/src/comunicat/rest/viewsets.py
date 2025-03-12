from django.utils import translation
from rest_framework.viewsets import ViewSet

from comunicat.enums import Module

from django.conf import settings


class ComuniCatViewSet(ViewSet):
    module: Module | None = None

    def initial(self, request, *args, **kwargs):
        header_origin = request.headers.get("Origin")

        if header_origin == settings.MODULE_ORG_DOMAIN:
            self.module = Module.ORG
        else:
            self.module = Module.TOWERS

        return super().initial(request=request, *args, **kwargs)
