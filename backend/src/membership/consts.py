from comunicat.enums import Module
from django.conf import settings

MEMBERSHIP_BY_MODULE = {
    Module.ORG: {
        int(config[0]): int(config[1])
        for config in settings.MODULE_ORG_MEMBERSHIP_CONFIG
    },
    Module.TOWERS: {
        int(config[0]): int(config[1])
        for config in settings.MODULE_TOWERS_MEMBERSHIP_CONFIG
    },
}

MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS = {
    Module.ORG: {
        int(config[0]): int(config[1])
        for config in settings.MODULE_ORG_MEMBERSHIP_ACCOUNT_CONFIG
    },
    Module.TOWERS: {
        int(config[0]): int(config[1])
        for config in settings.MODULE_TOWERS_MEMBERSHIP_ACCOUNT_CONFIG
    },
}

# MEMBERSHIP_ACCOUNT_BY_MODULE_AND_AMOUNT = {
#     module: {
#         MEMBERSHIP_BY_MODULE[module][members]
#         + sum(
#             [
#                 MEMBERSHIP_BY_MODULE[module_required][members]
#                 for module_required in settings.MODULE_ALL_MEMBERSHIP_REQUIRED
#                 if module_required != module
#             ]
#         ): account_code
#         for members, account_code in vals.items()
#     }
#     for module, vals in MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS.items()
# }

MEMBERSHIP_ACCOUNTS_BY_MODULE_AND_AMOUNT = {
    module: {
        MEMBERSHIP_BY_MODULE[module][members]
        + sum(
            [
                MEMBERSHIP_BY_MODULE[module_required][members]
                for module_required in settings.MODULE_ALL_MEMBERSHIP_REQUIRED
                if module_required != module
            ]
        ): [(MEMBERSHIP_BY_MODULE[module][members], account_code)]
        + [
            (
                MEMBERSHIP_BY_MODULE[module_required][members],
                MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS[module_required][members],
            )
            for module_required in settings.MODULE_ALL_MEMBERSHIP_REQUIRED
            if module_required != module
        ]
        for members, account_code in vals.items()
    }
    for module, vals in MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS.items()
}

MEMBERSHIP_ACCOUNT_BY_MODULE_AND_AMOUNT = {
    module: {
        MEMBERSHIP_BY_MODULE[module][members]: account_code
        for members, account_code in vals.items()
    }
    for module, vals in MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS.items()
}

MEMBERSHIP_BY_ACCOUNT_AND_AMOUNT = {
    account_code: [(module, MEMBERSHIP_BY_MODULE[module][members])]
    + [
        (module, MEMBERSHIP_BY_MODULE[module_required][members])
        for module_required in settings.MODULE_ALL_MEMBERSHIP_REQUIRED
        if module_required != module
    ]
    for module, vals in MEMBERSHIP_ACCOUNT_BY_MODULE_AND_MEMBERS.items()
    for members, account_code in vals.items()
}

MEMBERSHIP_LENGTHS = {
    int(config[0]): int(config[1]) for config in settings.MODULE_ALL_MEMBERSHIP_CONFIG
}
