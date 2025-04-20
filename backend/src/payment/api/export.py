import datetime
from io import BytesIO

from django.db.models import Prefetch
from openpyxl.workbook import Workbook
from openpyxl.styles import numbers, Font

from comunicat.consts import SHORT_NAME_BY_MODULE
from comunicat.enums import Module

from django.utils.translation import gettext_lazy as _

from payment.enums import PaymentMethod, PaymentType
from payment.models import Payment, PaymentLine


def export_payments(
    date_from: datetime.date, date_to: datetime.date, module: Module
) -> BytesIO:
    payment_objs = list(
        Payment.objects.with_balance()
        .filter(date_accounting__gte=date_from, date_accounting__lte=date_to)
        .with_amount()
        .with_description()
        .select_related("entity", "transaction")
        .prefetch_related(
            Prefetch(
                "lines", PaymentLine.objects.with_description().order_by("amount")
            ),
        )
        .order_by("-date_accounting", "-date_interest", "-created_at")
    )

    wb = Workbook()
    ws = wb.active
    ws.title = str(_("Payments"))

    ws.append(
        [
            str(_(k))
            for k in [
                "Date",
                "Description",
                "Account",
                "Account name",
                "Module",
                "Amount",
                "Line amount",
                "Entity",
                "Method",
                "Balance",
            ]
        ]
    )

    ws.column_dimensions["A"].width = 15
    ws.column_dimensions["B"].width = 50
    ws.column_dimensions["C"].width = 10
    ws.column_dimensions["D"].width = 40
    ws.column_dimensions["E"].width = 20
    ws.column_dimensions["F"].width = 15
    ws.column_dimensions["G"].width = 15
    ws.column_dimensions["H"].width = 30
    ws.column_dimensions["I"].width = 15
    ws.column_dimensions["J"].width = 15

    ws.column_dimensions["A"].number_format = numbers.FORMAT_DATE_YYYYMMDD2
    ws.column_dimensions["F"].number_format = numbers.FORMAT_NUMBER_00
    ws.column_dimensions["G"].number_format = numbers.FORMAT_NUMBER_00
    ws.column_dimensions["J"].number_format = numbers.FORMAT_NUMBER_00

    font_fold = Font(bold=True)

    for cell in ws["1:1"]:
        cell.font = font_fold

    current_date = None
    for payment_obj in payment_objs:
        balance = ""
        payment_line_objs = list(payment_obj.lines.all())
        multiplier = 1 if payment_obj.type == PaymentType.DEBIT else -1
        if not current_date or payment_obj.date_accounting != current_date:
            balance = payment_obj.balance.amount
            current_date = payment_obj.date_accounting
        ws.append(
            [
                payment_obj.date_accounting.strftime("%Y-%m-%d"),
                payment_obj.description,
                (
                    ""
                    if len(payment_line_objs) > 1
                    else (
                        payment_line_objs[0].account.code
                        if payment_line_objs[0].account
                        else ""
                    )
                ),
                (
                    ""
                    if len(payment_line_objs) > 1
                    else (
                        payment_line_objs[0].account.full_name
                        if payment_line_objs[0].account
                        else ""
                    )
                ),
                (
                    ""
                    if len(payment_line_objs) > 1
                    else (
                        SHORT_NAME_BY_MODULE[payment_line_objs[0].account.module]
                        if payment_line_objs[0].account
                        and payment_line_objs[0].account.module
                        else ""
                    )
                ),
                multiplier * sum(
                    [
                        payment_line_obj.amount.amount
                        for payment_line_obj in payment_line_objs
                    ]
                ),
                multiplier * (
                    ""
                    if len(payment_line_objs) > 1
                    else payment_line_objs[0].amount.amount
                ),
                (
                    f"{payment_obj.entity.firstname} {payment_obj.entity.lastname}"
                    if payment_obj.entity
                    else ""
                ),
                PaymentMethod(payment_obj.method).name if payment_obj.method else "",
                balance,
            ]
        )
        if len(payment_line_objs) > 1:
            for payment_line_obj in payment_line_objs:
                ws.append(
                    [
                        "",
                        payment_line_obj.description,
                        payment_line_obj.account.code if payment_line_obj.account else "",
                        (
                            payment_line_obj.account.full_name
                            if payment_line_obj.account
                            else ""
                        ),
                        (
                            SHORT_NAME_BY_MODULE[payment_line_obj.account.module]
                            if payment_line_obj.account and payment_line_obj.account.module
                            else ""
                        ),
                        "",
                        multiplier * payment_line_obj.amount.amount,
                        "",
                        "",
                        "",
                    ]
                )

    bytes_workbook = BytesIO()
    wb.save(bytes_workbook)

    return bytes_workbook
