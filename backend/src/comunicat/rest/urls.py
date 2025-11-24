from django.urls import include, path, re_path
from drf_yasg.views import get_schema_view

from comunicat.rest.views import (
    user,
    membership,
    payment,
    event,
    legal,
    towers,
    order,
    org,
    product,
    data,
    media,
    admin,
    document,
    activity,
)
from comunicat.rest.utils.routers import UUIDRouter
from drf_yasg import openapi
from rest_framework import permissions


router = UUIDRouter()
router.register("user", user.UserAPI, "user")
router.register("user/family", user.UserFamilyAPI, "user_family")
router.register("user/family/member", user.UserFamilyMemberAPI, "user_family_member")
router.register(
    "user/family/member/request",
    user.UserFamilyMemberRequestAPI,
    "user_family_member_request",
)
router.register("membership", membership.MembershipAPI, "membership")
router.register("payment", payment.PaymentAPI, "payment")
router.register("payment/expense", payment.ExpenseAPI, "payment_expense")
router.register("payment/provider", payment.PaymentProviderAPI, "payment_provider")
router.register("event", event.EventAPI, "event")
router.register("event/registration", event.RegistrationAPI, "event_registration")
router.register("event/calendar", event.CalendarAPI, "event_calendar")
router.register("legal/team", legal.TeamAPI, "legal_team")
router.register("legal/bylaws", legal.BylawsAPI, "legal_bylaws")
router.register("towers/castle", towers.TowersCastleAPI, "towers_castle")
router.register("order", order.OrderAPI, "order")
router.register(
    "order/delivery/provider", order.DeliveryProviderAPI, "order_delivery_provider"
)
router.register("order/delivery/price", order.DeliveryPriceAPI, "order_delivery_price")
router.register("product", product.ProductAPI, "product")
router.register("org", org.OrgAPI, "org")
router.register("data/location", data.LocationAPI, "data_location")
router.register("media/release", media.ReleaseAPI, "media_release")
router.register("document", document.DocumentAPI, "document")
router.register("activity/program", activity.ProgramAPI, "activity_program")

router.register("admin/user", admin.AdminUserAPI, "admin_user")
router.register("admin/order", admin.AdminOrderAPI, "admin_order")
router.register("admin/event", admin.AdminEventAPI, "admin_event")


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
