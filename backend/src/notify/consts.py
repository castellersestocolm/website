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
            EmailType.GENERAL: {
                "html": "email/org/general/general.html",
            },
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
                "subject": _("Your order %s is now paid"),
                "html": "email/org/order/paid.html",
            },
            EmailType.REGISTRATION_PAID: {
                "subject": _("Your registration for %s is now paid"),
                "html": "email/org/registration/paid.html",
            },
            EmailType.CONTACT_MESSAGE: {
                "subject": _("Contact form — %s"),
                "html": "email/org/contact/message.html",
            },
            EmailType.PAYMENT_PAID: {
                "subject": _("Your payment has been processed — %s"),
                "html": "email/org/payment/paid.html",
            },
        }
    },
    Module.TOWERS: {
        NotificationType.EMAIL: {
            EmailType.GENERAL: {
                "html": "email/towers/general/general.html",
            },
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
                "subject": _("Your order %s is now paid"),
                "html": "email/towers/order/paid.html",
            },
            EmailType.REGISTRATION_PAID: {
                "subject": _("Your registration for %s is now paid"),
                "html": "email/towers/registration/paid.html",
            },
            EmailType.CONTACT_MESSAGE: {
                "subject": _("Contact form — %s"),
                "html": "email/towers/contact/message.html",
            },
            EmailType.PAYMENT_PAID: {
                "subject": _("Your payment has been processed — %s"),
                "html": "email/towers/payment/paid.html",
            },
        }
    },
}

EMAIL_RENDER_FUNCTION_PARAMS_BY_TYPE = {
    EmailType.GENERAL: ("get_generic_email_render", tuple()),
    EmailType.REGISTER: ("get_user_email_render", tuple()),
    EmailType.PASSWORD: ("get_user_email_render", tuple()),
    EmailType.WELCOME: ("get_user_email_render", tuple()),
    EmailType.IMPORTED: ("get_user_email_render", tuple()),
    EmailType.FAMILY_INVITE: ("get_user_email_render", tuple()),
    EmailType.EVENT_SIGNUP: ("get_user_email_render", tuple()),
    EmailType.MEMBERSHIP_RENEW: ("get_user_email_render", tuple()),
    EmailType.MEMBERSHIP_EXPIRED: ("get_user_email_render", tuple()),
    EmailType.MEMBERSHIP_PAID: ("get_user_email_render", tuple()),
    EmailType.MEMBERSHIP_CHECK: ("get_user_email_render", tuple()),
    EmailType.ORDER_CREATED: ("get_order_email_render", ("order_id",)),
    EmailType.ORDER_PAID: ("get_order_email_render", ("order_id",)),
    EmailType.REGISTRATION_PAID: (
        "get_registration_email_renders",
        ("registration_ids",),
    ),
    EmailType.CONTACT_MESSAGE: (
        "get_contact_message_email_render",
        ("contact_message_id",),
    ),
    EmailType.PAYMENT_PAID: (
        "get_payment_email_render",
        ("payment_id",),
    ),
}

GOOGLE_EMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
]
