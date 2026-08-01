import enum

from django.utils.translation import gettext_lazy as _


class MembershipStatus(enum.IntEnum):
    REQUESTED = 0
    PROCESSING = 1
    ACTIVE = 2
    EXPIRED = 3


MembershipStatus.labels = {
    MembershipStatus.REQUESTED: _("Requested"),
    MembershipStatus.PROCESSING: _("Processing"),
    MembershipStatus.ACTIVE: _("Active"),
    MembershipStatus.EXPIRED: _("Expired"),
}
