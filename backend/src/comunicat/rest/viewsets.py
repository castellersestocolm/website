from urllib.parse import urlparse

from rest_framework.viewsets import ViewSet

from comunicat.enums import Module

from django.conf import settings


class ComuniCatViewSet(ViewSet):
    module: Module | None = None

    def initial(self, request, *args, **kwargs):
        self.module = request.module if hasattr(request, "module") else Module.ORG

        return super().initial(request=request, *args, **kwargs)
