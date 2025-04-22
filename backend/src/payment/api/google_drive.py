from collections import defaultdict
from io import BytesIO
from uuid import UUID

import mimetypes

from django.db.models import Q

from comunicat.enums import Module
from integration.models import GoogleIntegration

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from payment.api.export import export_payments
from payment.consts import GOOGLE_DRIVE_SCOPES, GOOGLE_DRIVE_FILES_LIST, GOOGLE_DRIVE_ID
from payment.enums import ExpenseStatus
from payment.models import Statement, Receipt, Payment

from django.utils.translation import gettext_lazy as _


def upload_file(
    service,
    file_bytes: BytesIO,
    file_name: str,
    folder_id: str,
    mime_type: str | None = None,
) -> str:
    media = MediaIoBaseUpload(file_bytes, mimetype=mimetypes.guess_type(file_name)[0])
    file_name = ".".join(file_name.split(".")[:-1])

    results = (
        service.files()
        .list(
            pageSize=100,
            fields="files(id, name)",
            **GOOGLE_DRIVE_FILES_LIST,
            q=f"name = '{file_name}' and '{folder_id}' in parents",
        )
        .execute()
    )

    file_id_by_name = {file["name"]: file["id"] for file in results.get("files", [])}

    file_id = file_id_by_name.get(file_name)
    if file_id:
        metadata = {
            "name": file_name,
            **({"mimeType": mime_type} if mime_type is not None else {}),
        }
        file = (
            service.files()
            .update(
                fileId=file_id,
                body=metadata,
                media_body=media,
                fields="id",
                supportsAllDrives=True,
            )
            .execute()
        )
    else:
        metadata = {
            "name": file_name,
            "parents": [folder_id],
            **({"mimeType": mime_type} if mime_type is not None else {}),
        }
        file = (
            service.files()
            .create(
                body=metadata,
                media_body=media,
                fields="id",
                supportsAllDrives=True,
            )
            .execute()
        )

    return file["id"]


def create_folder(
    service,
    folder_name: str,
    parent_id: str | None = None,
) -> str:
    # TODO: Problematic if there are over 100 folders/months
    results = (
        service.files()
        .list(
            pageSize=100,
            fields="files(id, name)",
            **GOOGLE_DRIVE_FILES_LIST,
            **({"q": f"'{parent_id}' in parents"} if parent_id else {}),
        )
        .execute()
    )

    folder_id_by_name = {
        folder["name"]: folder["id"] for folder in results.get("files", [])
    }

    folder_id = folder_id_by_name.get(folder_name)
    if not folder_id:
        folder_id = (
            service.files()
            .create(
                body={
                    "name": folder_name,
                    "mimeType": "application/vnd.google-apps.folder",
                    **({"parents": [parent_id]} if parent_id else {}),
                },
                fields="id",
                supportsAllDrives=True,
            )
            .execute()["id"]
        )

    return folder_id


# TODO: Sync other files related to the statement like payments and expenses
def sync_statement(statement_id: UUID, module: Module) -> None:
    google_integration_obj = GoogleIntegration.objects.filter(module=module).first()

    if not google_integration_obj:
        return

    statement_obj = Statement.objects.filter(id=statement_id).first()

    if not statement_obj:
        return

    statement_year = str(statement_obj.date_from.year)
    statement_month = str(statement_obj.date_from.month)

    creds = Credentials.from_authorized_user_info(
        info=google_integration_obj.authorized_user_info,
        scopes=GOOGLE_DRIVE_SCOPES,
    )
    service = build("drive", "v3", credentials=creds)

    folder_year_id = create_folder(
        service=service, folder_name=statement_year, parent_id=GOOGLE_DRIVE_ID
    )
    folder_month_id = create_folder(
        service=service, folder_name=statement_month, parent_id=folder_year_id
    )

    file_extension = statement_obj.file.name.split(".")[-1]
    file_name = f"{statement_obj.source.name}_{statement_obj.date_from.strftime('%Y%m%d')}_{statement_obj.date_to.strftime('%Y%m%d')}.{file_extension}"

    upload_file(
        service=service,
        file_bytes=statement_obj.file.file,
        file_name=file_name,
        folder_id=folder_month_id,
    )

    payments_file = export_payments(
        date_from=statement_obj.date_from, date_to=statement_obj.date_to, module=module
    )
    payments_name = f"Payments_{statement_obj.date_from.strftime('%Y%m%d')}_{statement_obj.date_to.strftime('%Y%m%d')}.xlsx"
    upload_file(
        service=service,
        file_bytes=payments_file,
        file_name=payments_name,
        folder_id=folder_month_id,
        mime_type="application/vnd.google-apps.spreadsheet",
    )

    folder_receipts_id = create_folder(
        service=service, folder_name=str(_("Receipts")), parent_id=folder_month_id
    )

    payment_ids = list(
        Payment.objects.with_dates()
        .filter(
            date_accounting__gte=statement_obj.date_from,
            date_accounting__lte=statement_obj.date_to,
        )
        .values_list("id", flat=True)
    )
    receipt_objs = list(
        Receipt.objects.filter(
            Q(expense__status=ExpenseStatus.APPROVED) | Q(expense__isnull=True),
            payment_lines__payment_id__in=payment_ids,
        ).select_related("expense")
    )

    receipts_by_expense_id = defaultdict(list)
    expense_by_id = {}
    for receipt_obj in receipt_objs:
        if receipt_obj.expense:
            expense_by_id[receipt_obj.expense_id] = receipt_obj.expense
            receipts_by_expense_id[receipt_obj.expense_id].append(receipt_obj)
        else:
            receipts_by_expense_id[None].append(receipt_obj)

    for expense_obj in expense_by_id.values():
        # Reuse the same folder for the same entity
        folder_expense_id = create_folder(
            service=service,
            folder_name=expense_obj.entity.full_name,
            parent_id=folder_receipts_id,
        )

        if expense_obj.file:
            expense_extension = expense_obj.file.name.split(".")[-1]
            expense_name = f"{str(_('Expense'))}_{expense_obj.id}.{expense_extension}"

            upload_file(
                service=service,
                file_bytes=expense_obj.file.file,
                file_name=expense_name,
                folder_id=folder_expense_id,
            )

        for receipt_obj in receipts_by_expense_id[expense_obj.id]:
            receipt_extension = receipt_obj.file.name.split(".")[-1]
            receipt_name = f"{str(_('Receipt'))}_{receipt_obj.date.strftime('%Y%m%d')}_{receipt_obj.id}.{receipt_extension}"

            upload_file(
                service=service,
                file_bytes=receipt_obj.file.file,
                file_name=receipt_name,
                folder_id=folder_expense_id,
            )

    # Receipts that don't have an associated expense
    for receipt_obj in receipts_by_expense_id.get(None, []):
        receipt_extension = receipt_obj.file.name.split(".")[-1]
        receipt_name = f"{str(_('Receipt'))}_{receipt_obj.date.strftime('%Y%m%d')}_{receipt_obj.id}.{receipt_extension}"

        upload_file(
            service=service,
            file_bytes=receipt_obj.file.file,
            file_name=receipt_name,
            folder_id=folder_receipts_id,
        )

    return None
