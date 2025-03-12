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
