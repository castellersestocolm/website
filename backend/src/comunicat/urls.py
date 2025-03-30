from django.views.static import serve
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings

from comunicat import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health", views.health, name="health"),
    path("", include("comunicat.rest.urls")),
]


if "social_django" in settings.INSTALLED_APPS:
    urlpatterns += [
        path("api/1.0/user/", include("social_django.urls", namespace="user_social")),
    ]

# TODO: Temporary until they are served properly
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
