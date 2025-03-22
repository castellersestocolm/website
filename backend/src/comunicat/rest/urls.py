from django.urls import include, path, re_path
from drf_yasg.views import get_schema_view

from comunicat.rest.views import user, membership, payment, event, legal
from comunicat.rest.utils.routers import UUIDRouter
from drf_yasg import openapi
from rest_framework import permissions


router = UUIDRouter()
router.register("user", user.UserAPI, "user")
router.register("user/family/member", user.UserFamilyMemberAPI, "user_family_member")
router.register(
    "user/family/member/request",
    user.UserFamilyMemberRequestAPI,
    "user_family_member_request",
)
router.register("membership", membership.MembershipAPI, "membership")
router.register("payment", payment.PaymentAPI, "payment")
router.register("event", event.EventAPI, "event")
router.register("event/registration", event.RegistrationAPI, "event_registration")
router.register("legal/team", legal.TeamAPI, "legal_team")
router.register("legal/bylaws", legal.BylawsAPI, "legal_bylaws")


api_patterns = [
    path("", include(router.urls)),
]
api_patterns = [path("1.0/", include((api_patterns, "comunicat"), namespace="1.0"))]
api_patterns = [path("api/", include((api_patterns, "comunicat"), namespace="api"))]

api_schema_view = get_schema_view(
    openapi.Info(
        title="Comunicat API",
        default_version="1.0",
        description="API for the ComuniCAT backend",
    ),
    public=True,
    permission_classes=(permissions.IsAdminUser,),
    patterns=api_patterns,
)

urlpatterns = [
    path("", include(api_patterns)),
    re_path(
        r"^api/1.0/schema(?P<format>\.json|\.yaml)$",
        api_schema_view.without_ui(cache_timeout=0),
        name="schema",
    ),
    re_path(
        r"^api/1.0/swagger/$",
        api_schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    re_path(
        r"^api/1.0/redoc/$",
        api_schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
]
