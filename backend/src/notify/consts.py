from modulefinder import Module

from comunicat.enums import Module
from notify.enums import NotificationType, EmailType

from django.conf import settings

from django.utils.translation import gettext_lazy as _


EMAIL_BY_MODULE = {
    Module.ORG: settings.MODULE_ORG_EMAIL_FROM_FULL,
    Module.TOWERS: settings.MODULE_TOWERS_EMAIL_FROM_FULL,
}

SETTINGS_BY_MODULE = {
    Module.ORG: {
        "module": Module.ORG,
        "name": settings.MODULE_ORG_NAME,
        "email": settings.MODULE_ORG_EMAIL_FROM_ADDRESS,
    },
    Module.TOWERS: {
        "module": Module.TOWERS,
        "name": settings.MODULE_TOWERS_NAME,
        "email": settings.MODULE_TOWERS_EMAIL_FROM_ADDRESS,
    },
}

TEMPLATE_BY_MODULE = {
    Module.ORG: {
        NotificationType.EMAIL: {
            "user": {
                EmailType.REGISTER: {
                    "subject": _("Confirm your email to finish your registration"),
                    "html": "email/org/user/register.html",
                },
                EmailType.PASSWORD: {
                    "subject": _("Reset your password to login"),
                    "html": "email/org/user/password.html",
                },
                EmailType.WELCOME: {
                    "subject": _("Welcome to %s") % (settings.MODULE_ORG_NAME,),
                    "html": "email/org/user/welcome.html",
                },
                EmailType.IMPORTED: {
                    "subject": _("Welcome to %s new website") % (settings.MODULE_ORG_NAME,),
                    "html": "email/org/user/imported.html",
                },
                EmailType.FAMILY_INVITE: {
                    "subject": _("You have been invited to join a family"),
                    "html": "email/org/user/invite.html",
                },
            },
        }
    },
    Module.TOWERS: {
        NotificationType.EMAIL: {
            "user": {
                EmailType.REGISTER: {
                    "subject": _("Confirm your email to finish your registration"),
                    "html": "email/towers/user/register.html",
                },
                EmailType.PASSWORD: {
                    "subject": _("Reset your password to login"),
                    "html": "email/towers/user/password.html",
                },
                EmailType.WELCOME: {
                    "subject": _("Welcome to %s") % (settings.MODULE_TOWERS_NAME,),
                    "html": "email/towers/user/welcome.html",
                },
                EmailType.IMPORTED: {
                    "subject": _("Welcome to %s new website") % (settings.MODULE_TOWERS_NAME,),
                    "html": "email/towers/user/imported.html",
                },
                EmailType.FAMILY_INVITE: {
                    "subject": _("You have been invited to join a family"),
                    "html": "email/towers/user/invite.html",
                },
            },
        }
    },
}
