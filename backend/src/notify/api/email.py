from typing import Optional

import html2text
from django.core.mail import EmailMultiAlternatives

from django.conf import settings


def send_email(
    subject: str,
    body: str,
    to: str,
    from_email: Optional[str] = None,
    reply_to: Optional[list[str]] = None,
    track_clicks: bool = False,
    fail_silently: bool = False,
    attachments: list = None,
) -> None:
    if to and not isinstance(to, (list, tuple)):
        to = [to]

    if reply_to and not isinstance(reply_to, (list, tuple)):
        reply_to = [reply_to]

    print(body)

    body_plain = html2text.html2text(body)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=body_plain,
        from_email=from_email or settings.DEFAULT_FROM_EMAIL,
        to=to,
        reply_to=reply_to or [settings.DEFAULT_FROM_EMAIL],
        attachments=attachments,
    )

    msg.attach_alternative(body, "text/html")

    msg.track_clicks = track_clicks

    return msg.send(fail_silently=fail_silently)
