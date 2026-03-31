from django.contrib.admin import SimpleListFilter
from django.db.models import Exists, OuterRef

from django.utils.translation import gettext_lazy as _

from payment.models import Payment


class EntityHasPaymentFilter(SimpleListFilter):
    title = _("has payment")
    parameter_name = "payment"

    def lookups(self, request, model_admin):
        return [
            (True, _("Yes")),
            (False, _("No")),
        ]

    def queryset(self, request, queryset):
        value = self.value()

        if value is None:
            return queryset

        return queryset.annotate(
            has_payment=Exists(Payment.objects.filter(entity_id=OuterRef("id")))
        ).filter(has_payment=value)
