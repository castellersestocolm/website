from django.db.models import BooleanField, Case, Q, QuerySet, Value, When

from comunicat.enums import Module
from consent.consts import REQUIRED_CONSENT_TYPE_BY_MODULE


class EntityConsentQuerySet(QuerySet):
    def with_is_required(self):
        return self.annotate(
            is_required=Case(
                When(
                    Q(
                        module=Module.ORG,
                        type__in=REQUIRED_CONSENT_TYPE_BY_MODULE[Module.ORG],
                    ),
                    then=Value(True),
                ),
                When(
                    Q(
                        module=Module.TOWERS,
                        type__in=REQUIRED_CONSENT_TYPE_BY_MODULE[Module.TOWERS],
                    ),
                    then=Value(True),
                ),
                default=Value(False),
                output_field=BooleanField(),
            ),
        )
