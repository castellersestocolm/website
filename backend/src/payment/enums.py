from enum import IntEnum


class PaymentType(IntEnum):
    DEBIT = 10
    CREDIT = 20


class PaymentStatus(IntEnum):
    PENDING = 10
    PROCESSING = 20
    COMPLETED = 30
    CANCELED = 40


class PaymentMethod(IntEnum):
    CASH = 10
    TRANSFER = 20

    # https://www.iso.org/obp/ui/#iso:code:3166:SE
    SE_SWISH = 75201
    SE_PLUSGIRO = 75202


class SourceType(IntEnum):
    BANK = 10


class AccountCategory(IntEnum):
    ASSETS = 10
    SAVINGS = 20
    GRANTS = 30
    DONATIONS = 40
    DEBTS = 50
    MEMBERSHIPS = 60
    EVENTS = 70
    EXPENSES = 80
    RENT = 90
    SALARIES = 100
    TAX = 110
    INSURANCE = 120
    LOSSES = 130
    SALES = 140
    INTEREST = 150


class TransactionImportStatus(IntEnum):
    CREATED = 10
    RUNNING = 20
    COMPLETED = 30
    ERRORED = 40


class ExpenseStatus(IntEnum):
    CREATED = 10
    PROCESSING = 20
    APPROVED = 30
    REJECTED = 40
    DELETED = 50


class ReceiptType(IntEnum):
    PERSONAL = 10
    BUSINESS = 20


class ReceiptStatus(IntEnum):
    CREATED = 10
    DELETED = 20
