from django.views.static import serve
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings

from comunicat import views
from comunicat.views import ServeSignedStorageView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health", views.health, name="health"),
    path("", include("comunicat.rest.urls")),
]


if "social_django" in settings.INSTALLED_APPS:
    urlpatterns += [
        path("api/1.0/user/", include("social_django.urls", namespace="user_social")),
    ]

if "silk" in settings.INSTALLED_APPS:
    urlpatterns += [
        path("silk/", include("silk.urls", namespace="silk")),
    ]

if "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar.toolbar

    urlpatterns += debug_toolbar.toolbar.debug_toolbar_urls()

# TODO: Temporary until they are served properly
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]

urlpatterns += [
    re_path(r"^media-private/(?P<path>.*)$", ServeSignedStorageView.as_view()),
]
