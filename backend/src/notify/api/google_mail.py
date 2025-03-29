import base64

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import html2text
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from comunicat.enums import Module
from integration.models import GoogleIntegration
from notify.consts import GOOGLE_EMAIL_SCOPES


def send_email(
    subject: str,
    from_email: str,
    to_email: str | list[str],
    reply_email: str,
    body: str,
    attachments: list,
    module: Module,
):
    google_integration_obj = GoogleIntegration.objects.filter(module=module).first()

    creds = Credentials.from_authorized_user_info(
        info=google_integration_obj.authorized_user_info,
        scopes=GOOGLE_EMAIL_SCOPES,
    )

    service = build("gmail", "v1", credentials=creds)

    to_emails = to_email if isinstance(to_email, list) else [to_email]

    for email in to_emails:
        message = MIMEMultipart("alternative")

        body_plain = html2text.html2text(body)

        part1 = MIMEText(body_plain, "plain")
        part2 = MIMEText(body, "html")

        message.attach(part1)
        message.attach(part2)

        message["To"] = email
        message["From"] = from_email
        message["ReplyTo"] = reply_email
        message["Subject"] = subject

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {"raw": encoded_message}

        service.users().messages().send(userId="me", body=create_message).execute()
