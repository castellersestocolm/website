import logging

from rest_framework.throttling import ScopedRateThrottle

_log = logging.getLogger(__name__)


class CFConnectingIPIdent:
    """
    A mixin to be set on a RateThrottle class
    that'll use Cloudflare's CF-Connecting-IP value
    if set.
    """

    def get_ident(self, request):
        cf_connecting_ip = request.headers.get("Cf-Connecting-Ip")
        if not cf_connecting_ip:
            return super().get_ident(request)
        return cf_connecting_ip


class MScopedRateThrottle(CFConnectingIPIdent, ScopedRateThrottle):
    pass
