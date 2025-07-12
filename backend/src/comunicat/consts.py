from comunicat.enums import Module

from django.conf import settings

from legal.enums import PermissionLevel

CODE_NAME_BY_MODULE = {
    Module.ORG: settings.MODULE_ORG_CODE_NAME,
    Module.TOWERS: settings.MODULE_TOWERS_CODE_NAME,
}

SHORT_NAME_BY_MODULE = {
    Module.ORG: settings.MODULE_ORG_SHORT_NAME,
    Module.TOWERS: settings.MODULE_TOWERS_SHORT_NAME,
}

DOMAIN_BY_MODULE = {
    Module.ORG: settings.MODULE_ORG_DOMAIN,
    Module.TOWERS: settings.MODULE_TOWERS_DOMAIN,
}

PERMISSIONS_BY_LEVEL = {
    "event": {
        "registration": {
            "list": PermissionLevel.ADMIN,
        }
    },
    "user": {
        "user": {
            "list": PermissionLevel.ADMIN,
        }
    },
}
