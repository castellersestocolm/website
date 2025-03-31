from comunicat.enums import Module

from django.conf import settings

CODE_NAME_BY_MODULE = {
    Module.ORG: settings.MODULE_ORG_CODE_NAME,
    Module.TOWERS: settings.MODULE_TOWERS_CODE_NAME,
}

SHORT_NAME_BY_MODULE = {
    Module.ORG: settings.MODULE_ORG_SHORT_NAME,
    Module.TOWERS: settings.MODULE_TOWERS_SHORT_NAME,
}
