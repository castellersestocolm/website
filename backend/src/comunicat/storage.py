from django.conf import settings
from django.core.files.storage import FileSystemStorage
from comunicat.utils.media import sign_url


class SignedStorage(FileSystemStorage):
    def __init__(
        self,
        minutes: int = 60,
        location: str | None = None,
        base_url: str | None = None,
        *args,
        **kwargs
    ):
        self.minutes = minutes
        super().__init__(
            location=location or settings.MEDIA_SIGNED_ROOT,
            base_url=base_url or settings.MEDIA_SIGNED_URL,
            *args,
            **kwargs
        )

    def url(self, name):
        return self.get_signed_url(name=name)

    def get_signed_url(self, name: str, minutes: int | None = None) -> str:
        url = super().url(name)

        return sign_url(url, minutes=minutes or self.minutes)


signed_storage = SignedStorage(allow_overwrite=True)
