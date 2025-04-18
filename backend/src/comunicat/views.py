from django.conf import settings
from django.http import HttpResponse, FileResponse
from django.views import View
from django.views.static import serve

from comunicat.mixin import ServeSignedStorageMixin


def health(request):
    return HttpResponse(status=200)


class ServeSignedStorageView(ServeSignedStorageMixin, View):
    def get(self, request, path, *args, **kwargs):
        return serve(request, path, document_root=settings.MEDIA_SIGNED_ROOT)
