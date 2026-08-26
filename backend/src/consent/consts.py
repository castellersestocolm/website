from django.conf import settings

from comunicat.enums import Module
from consent.enums import ConsentType

REQUIRED_CONSENT_TYPE_BY_MODULE = {
    Module.ORG: set(settings.MODULE_ORG_REQUIRED_CONSENT_TYPES).union(
        {ConsentType.GENERAL}
    ),
    Module.TOWERS: set(settings.MODULE_TOWERS_REQUIRED_CONSENT_TYPES).union(
        {ConsentType.GENERAL}
    ),
}
