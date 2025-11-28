from typing import Optional

from django.conf import settings

from comunicat.enums import Module

import notify.api.google_mail


def send_email(
    subject: str,
    body: str,
    to: str,
    module: Module,
    from_email: Optional[str] = None,
    reply_to: Optional[str] = None,
    cc_to: Optional[str | list[str]] = None,
    track_clicks: bool = False,
    fail_silently: bool = False,
    attachments: list | None = None,
) -> None:
    if to and not isinstance(to, (list, tuple)):
        to = [to]

    return notify.api.google_mail.send_email(
        subject=subject,
        body=body,
        from_email=from_email or settings.DEFAULT_FROM_EMAIL,
        to_email=to,
        reply_email=reply_to or settings.DEFAULT_FROM_EMAIL,
        cc_email=cc_to,
        attachments=attachments,
        module=module,
    )

    # body_plain = html2text.html2text(body)
    #
    # msg = EmailMultiAlternatives(
    #     subject=subject,
    #     body=body_plain,
    #     from_email=from_email or settings.DEFAULT_FROM_EMAIL,
    #     to=to,
    #     reply_to=reply_to or [settings.DEFAULT_FROM_EMAIL],
    #     attachments=attachments,
    # )
    #
    # msg.attach_alternative(body, "text/html")
    #
    # msg.track_clicks = track_clicks
    #
    # return msg.send(fail_silently=fail_silently)
