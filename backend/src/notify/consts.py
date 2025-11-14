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
                    "subject": _("Welcome to Les Quatre Barres"),
                    "html": "email/org/user/welcome.html",
                },
                EmailType.IMPORTED: {
                    "subject": _("Welcome to Les Quatre Barres new website"),
                    "html": "email/org/user/imported.html",
                },
                EmailType.FAMILY_INVITE: {
                    "subject": _("You have been invited to join a family"),
                    "html": "email/org/user/invite.html",
                },
                EmailType.EVENT_SIGNUP: {
                    "subject": _("Sign-up for the upcoming events"),
                    "html": "email/org/user/signup.html",
                },
                EmailType.MEMBERSHIP_RENEW: {
                    "subject": _("Time to renew your membership"),
                    "html": "email/org/membership/renew.html",
                },
                EmailType.MEMBERSHIP_EXPIRED: {
                    "subject": _("Your membership has expired"),
                    "html": "email/org/membership/expired.html",
                },
                EmailType.MEMBERSHIP_PAID: {
                    "subject": _("Your membership is now paid"),
                    "html": "email/org/membership/paid.html",
                },
                EmailType.MEMBERSHIP_CHECK: {
                    "subject": _("Your membership status"),
                    "html": "email/org/membership/check.html",
                },
                EmailType.ORDER_CREATED: {
                    "subject": _("Thank you for your order"),
                    "html": "email/org/order/created.html",
                },
                EmailType.ORDER_PAID: {
                    "subject": _("Your order is now paid"),
                    "html": "email/org/order/paid.html",
                },
                EmailType.REGISTRATION_PAID: {
                    "subject": _("Your registration is now paid"),
                    "html": "email/org/registration/paid.html",
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
                    "subject": _("Welcome to Castellers d'Estocolm"),
                    "html": "email/towers/user/welcome.html",
                },
                EmailType.IMPORTED: {
                    "subject": _("Welcome to Castellers d'Estocolm new website"),
                    "html": "email/towers/user/imported.html",
                },
                EmailType.FAMILY_INVITE: {
                    "subject": _("You have been invited to join a family"),
                    "html": "email/towers/user/invite.html",
                },
                EmailType.EVENT_SIGNUP: {
                    "subject": _("Sign-up for the upcoming events and rehearsals"),
                    "html": "email/towers/user/signup.html",
                },
                EmailType.MEMBERSHIP_RENEW: {
                    "subject": _("Time to renew your membership"),
                    "html": "email/towers/membership/renew.html",
                },
                EmailType.MEMBERSHIP_EXPIRED: {
                    "subject": _("Your membership has expired"),
                    "html": "email/towers/membership/expired.html",
                },
                EmailType.MEMBERSHIP_PAID: {
                    "subject": _("Your membership is now paid"),
                    "html": "email/towers/membership/paid.html",
                },
                EmailType.MEMBERSHIP_CHECK: {
                    "subject": _("Your membership status"),
                    "html": "email/towers/membership/check.html",
                },
                EmailType.ORDER_CREATED: {
                    "subject": _("Thank you for your order"),
                    "html": "email/towers/order/created.html",
                },
                EmailType.ORDER_PAID: {
                    "subject": _("Your order is now paid"),
                    "html": "email/towers/order/paid.html",
                },
                EmailType.REGISTRATION_PAID: {
                    "subject": _("Your registration is now paid"),
                    "html": "email/towers/registration/paid.html",
                },
            },
        }
    },
}

GOOGLE_EMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
]
