from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("comunicat.rest.urls")),
]


if "social_django" in settings.INSTALLED_APPS:
    urlpatterns += [
        path("api/1.0/user/", include("social_django.urls", namespace="user_social")),
    ]

# TODO: Temporary until they are served properly
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
