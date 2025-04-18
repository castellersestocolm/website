from django.core.exceptions import PermissionDenied

from comunicat.utils.media import check_signature


class ServeSignedStorageMixin:
    def dispatch(self, request, path, *args, **kwargs):
        if not check_signature(request.get_full_path()):
            raise PermissionDenied()

        return super().dispatch(request, path=path, *args, **kwargs)
