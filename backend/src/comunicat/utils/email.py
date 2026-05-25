from comunicat.consts import DOMAIN_BY_MODULE
from comunicat.enums import Module
from user.models import User


def get_module_emails_from_user(
    user_obj: User, module: Module | None = None
) -> list[str]:
    email_domains = (
        [f"@{DOMAIN_BY_MODULE[module]}"]
        if module is not None
        else [f"@{domain}" for domain in DOMAIN_BY_MODULE.values()]
    )
    return [
        tmp_email
        for tmp_email in [user_obj.email]
        + (
            [user_email_obj.email for user_email_obj in user_obj.emails.all()]
            if hasattr(user_obj, "emails")
            else []
        )
        if any([tmp_email.endswith(email_domain) for email_domain in email_domains])
    ][:1]
