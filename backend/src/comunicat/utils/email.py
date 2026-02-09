from comunicat.consts import DOMAIN_BY_MODULE
from comunicat.enums import Module
from user.models import User


def get_module_emails_from_user(user_obj: User, module: Module) -> list[str]:
    email_domain = f"@{DOMAIN_BY_MODULE[module]}"
    return [
        tmp_email
        for tmp_email in [user_obj.email]
        + (
            [user_email_obj.email for user_email_obj in user_obj.emails.all()]
            if hasattr(user_obj, "emails")
            else []
        )
        if tmp_email.endswith(email_domain)
    ][:1]
