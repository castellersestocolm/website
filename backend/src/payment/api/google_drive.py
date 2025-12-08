from collections import defaultdict
from uuid import UUID

from django.db.models import Q

from comunicat.enums import Module
from integration.api.google.drive import create_folder, upload_file, get_service

from payment.api.export import export_payments
from payment.consts import GOOGLE_DRIVE_ID, GOOGLE_DRIVE_FOLDER_ID
from payment.enums import ExpenseStatus
from payment.models import Statement, Receipt, Payment

from django.utils.translation import gettext_lazy as _


# TODO: Sync other files related to the statement like payments and expenses
def sync_statement(statement_id: UUID, module: Module) -> None:
    statement_obj = Statement.objects.filter(id=statement_id).first()

    if not statement_obj:
        return

    service = get_service(module=module)

    if not service:
        return None

    statement_year = str(statement_obj.date_from.year)
    statement_month = str(statement_obj.date_from.month)

    folder_year_id = create_folder(
        service=service,
        drive_id=GOOGLE_DRIVE_ID,
        folder_name=statement_year,
        parent_id=GOOGLE_DRIVE_FOLDER_ID,
    )
    folder_month_id = create_folder(
        service=service,
        drive_id=GOOGLE_DRIVE_ID,
        folder_name=statement_month,
        parent_id=folder_year_id,
    )

    file_extension = statement_obj.file.name.split(".")[-1]
    file_name = f"{statement_obj.source.name}_{statement_obj.date_from.strftime('%Y%m%d')}_{statement_obj.date_to.strftime('%Y%m%d')}.{file_extension}"

    upload_file(
        service=service,
        drive_id=GOOGLE_DRIVE_ID,
        file_bytes=statement_obj.file.file,
        file_name=file_name,
        folder_id=folder_month_id,
    )

    payments_file = export_payments(
        date_from=statement_obj.date_from, date_to=statement_obj.date_to, module=module
    )
    payments_name = f"{str(_('Payments'))}_{statement_obj.date_from.strftime('%Y%m%d')}_{statement_obj.date_to.strftime('%Y%m%d')}.xlsx"
    upload_file(
        service=service,
        drive_id=GOOGLE_DRIVE_ID,
        file_bytes=payments_file,
        file_name=payments_name,
        folder_id=folder_month_id,
        mime_type="application/vnd.google-apps.spreadsheet",
    )

    folder_receipts_id = create_folder(
        service=service,
        drive_id=GOOGLE_DRIVE_ID,
        folder_name=str(_("Receipts")),
        parent_id=folder_month_id,
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
            drive_id=GOOGLE_DRIVE_ID,
            folder_name=expense_obj.entity.full_name,
            parent_id=folder_receipts_id,
        )

        if expense_obj.file:
            expense_extension = expense_obj.file.name.split(".")[-1]
            expense_name = f"{str(_('Expense'))}_{expense_obj.id}.{expense_extension}"

            upload_file(
                service=service,
                drive_id=GOOGLE_DRIVE_ID,
                file_bytes=expense_obj.file.file,
                file_name=expense_name,
                folder_id=folder_expense_id,
            )

        for receipt_obj in receipts_by_expense_id[expense_obj.id]:
            receipt_extension = receipt_obj.file.name.split(".")[-1]
            receipt_name = f"{str(_('Receipt'))}_{receipt_obj.date.strftime('%Y%m%d')}_{receipt_obj.id}.{receipt_extension}"

            upload_file(
                service=service,
                drive_id=GOOGLE_DRIVE_ID,
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
            drive_id=GOOGLE_DRIVE_ID,
            file_bytes=receipt_obj.file.file,
            file_name=receipt_name,
            folder_id=folder_receipts_id,
        )

    return None
