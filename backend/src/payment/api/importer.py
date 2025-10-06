import csv
import datetime
import difflib
import itertools
import re
from collections import OrderedDict
from typing import List
from uuid import UUID

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from djmoney.money import Money
from phonenumber_field.phonenumber import PhoneNumber

from membership.consts import MEMBERSHIP_ACCOUNTS_BY_MODULE_AND_AMOUNT
from membership.enums import MembershipStatus
from membership.models import Membership
from payment.consts import EDIT_DISTANCE_NAME_THRESHOLD, EDIT_DISTANCE_ACCOUNT_THRESHOLD
from payment.enums import (
    TransactionImportStatus,
    PaymentMethod,
    PaymentType,
    PaymentStatus,
    AccountCategory,
)
from payment.models import (
    Transaction,
    TransactionImport,
    Entity,
    Payment,
    PaymentLine,
    Account,
)

from django.conf import settings

import membership.api

from user.models import User

import unicodedata


@transaction.atomic
def run(transaction_import_id: UUID) -> List[Transaction]:
    transaction_import_obj = TransactionImport.objects.filter(
        id=transaction_import_id,
        status__in=(TransactionImportStatus.CREATED, TransactionImportStatus.ERRORED),
    ).first()

    if not transaction_import_obj:
        return []

    if transaction_import_obj.file:
        csv_input = transaction_import_obj.file.open("r").readlines()
    else:
        csv_input = transaction_import_obj.input.split("\n")

    reader = csv.DictReader(csv_input, delimiter=";")

    transaction_objs = []

    user_by_name = OrderedDict(
        [
            (f"{user_obj.firstname} {user_obj.lastname}", user_obj)
            for user_obj in User.objects.select_related(
                "family_member", "family_member__family"
            ).order_by("id")
            if user_obj.is_adult
        ]
    )
    entity_by_name = OrderedDict(
        [
            (
                f"{entity_obj.firstname if entity_obj.firstname else ''} {entity_obj.lastname if entity_obj.lastname else ''}",
                entity_obj,
            )
            for entity_obj in Entity.objects.order_by("id")
        ]
    )

    account_objs = list(
        Account.objects.filter(allow_transactions=True).prefetch_related("tags")
    )
    account_membership_by_code = {
        account_obj.code: account_obj
        for account_obj in Account.objects.filter(
            allow_transactions=True, category=AccountCategory.MEMBERSHIPS
        ).prefetch_related("tags")
    }

    membership_module_type = ContentType.objects.get_by_natural_key(
        "membership", "membershipmodule"
    )

    try:
        for row in reader:
            method = PaymentMethod[row["method"].upper()]
            # Replace U+2212 for "-" (surprisingly "−" != "-")
            amount = Money(
                amount=row["amount"]
                .replace(" ", "")
                .replace(",", ".")
                .replace("−", "-")
                .replace(" ", ""),
                currency=settings.MODULE_ALL_CURRENCY,
            )
            vat = row.get("vat", settings.MODULE_ALL_VAT)
            text = re.sub(
                r" +", " ", row.get("text").replace(" .", ".").strip().strip(".")
            )
            sender = (
                row["sender"].replace("-", "-").replace(" ", " ").strip().strip(".")
                if "sender" in row and row["sender"]
                else None
            )
            reference = row.get("reference")
            external_id = row.get("external_id")
            date_accounting = datetime.date.fromisoformat(row["date_accounting"])
            date_interest = (
                datetime.date.fromisoformat(row["date_interest"])
                if "date_interest" in row
                else None
            )
            extra = {}
            for k, v in row.items():
                if method.name.lower() in k:
                    extra[k.replace(f"{method}:", "")] = v

            found_user_obj = None
            found_entity_obj = None

            if sender:
                if "," in sender:
                    sender = " ".join(list(reversed(sender.split(",")))).strip()

                user_score = None
                entity_score = None

                for user_name, user_obj in user_by_name.items():
                    current_score = difflib.SequenceMatcher(
                        None, sender.lower(), user_name.lower()
                    ).ratio()
                    if current_score >= EDIT_DISTANCE_NAME_THRESHOLD and (
                        user_score is None or current_score > user_score
                    ):
                        found_user_obj = user_obj
                        user_score = current_score

                for entity_name, entity_obj in entity_by_name.items():
                    current_score = difflib.SequenceMatcher(
                        None, sender.lower(), entity_name.lower()
                    ).ratio()
                    if current_score >= EDIT_DISTANCE_NAME_THRESHOLD and (
                        entity_score is None or current_score > entity_score
                    ):
                        found_entity_obj = entity_obj
                        entity_score = current_score

                if not found_entity_obj:
                    if found_user_obj and hasattr(found_user_obj, "entity"):
                        found_entity_obj = found_user_obj.entity
                    else:
                        name_parts = sender.split(" ")
                        firstname = "-".join(
                            [f.capitalize() for f in name_parts[0].split("-")]
                        )
                        lastname_parts = []
                        for part in name_parts[1:]:
                            lastname_parts.append(
                                "-".join(
                                    [
                                        p.capitalize() if len(p) > 3 else p
                                        for p in part.split("-")
                                    ]
                                )
                            )
                        lastname = " ".join(lastname_parts)
                        if "phone_sender" in extra:
                            phone = extra["phone_sender"]
                            # TODO: Refactor this into a proper function or setting
                            if settings.PHONENUMBER_DEFAULT_REGION == "SE":
                                phone = (
                                    f"+{phone}" if not phone.startswith("0") else phone
                                )
                            phone = str(
                                PhoneNumber.from_string(
                                    phone.replace(" ", "").replace("-", "")
                                )
                            )
                        else:
                            phone = None
                        if found_user_obj:
                            found_entity_obj = Entity.objects.create(
                                firstname=found_user_obj.firstname,
                                lastname=found_user_obj.lastname,
                                email=found_user_obj.email,
                                phone=found_user_obj.phone,
                                user=found_user_obj,
                            )
                        else:
                            found_entity_obj = Entity.objects.create(
                                firstname=firstname,
                                lastname=lastname,
                                phone=phone,
                            )
                        entity_by_name[f"{firstname} {lastname}"] = found_entity_obj

            transaction_data = {
                "vat": vat,
                "external_id": external_id,
                "date_interest": date_interest,
                "importer": transaction_import_obj,
                "extra": extra,
            }

            transaction_obj, __ = Transaction.objects.update_or_create(
                source=transaction_import_obj.source,
                method=method,
                amount=amount,
                text=text,
                sender=sender,
                reference=reference,
                date_accounting=date_accounting,
                defaults=transaction_data,
            )

            payment_type = (
                PaymentType.DEBIT if amount.amount >= 0 else PaymentType.CREDIT
            )

            top_found_accounts = []
            search_text = unicodedata.normalize(
                "NFKD", re.sub(r"[^\w\s]", "", text)
            ).lower()

            # TODO: Improve this with knowledge of the system such as membership in modules
            # TODO: Gather top 5 scores and refine with account category
            for account_obj in account_objs:
                if account_obj.type and account_obj.type != payment_type:
                    continue
                for account_tag_obj in account_obj.tags.all():
                    current_score = difflib.SequenceMatcher(
                        None,
                        search_text,
                        unicodedata.normalize("NFKD", account_tag_obj.name).lower(),
                    ).ratio()
                    if current_score >= EDIT_DISTANCE_ACCOUNT_THRESHOLD:
                        if len(top_found_accounts) < 5:
                            top_found_accounts.append((current_score, account_obj))
                        else:
                            top_found_accounts = list(
                                sorted(top_found_accounts, key=lambda a: a[0])
                            )
                            if current_score > top_found_accounts[0][0]:
                                top_found_accounts[0] = (current_score, account_obj)

            found_account_obj = None

            top_found_accounts = list(sorted(top_found_accounts, key=lambda a: -a[0]))
            if top_found_accounts:
                found_account_obj = top_found_accounts[0][1]

            found_accounts = []
            if found_account_obj:
                if found_account_obj.category == AccountCategory.MEMBERSHIPS:
                    has_found_new_account = False
                    # TODO: Only really working because amounts are different
                    for (
                        module,
                        vals,
                    ) in MEMBERSHIP_ACCOUNTS_BY_MODULE_AND_AMOUNT.items():
                        if has_found_new_account:
                            break
                        for membership_amount, account_config in vals.items():
                            if has_found_new_account:
                                break
                            for account_amount, account_code in account_config:
                                if (
                                    int(amount.amount) == membership_amount
                                    and account_code in account_membership_by_code
                                ):
                                    found_accounts.append(
                                        (
                                            account_amount,
                                            account_membership_by_code[account_code],
                                        )
                                    )
                                    has_found_new_account = True
                else:
                    found_accounts = [(abs(amount.amount), found_account_obj)]

            # TODO: Create membership from payment if not found
            # TODO: If not existing split into multiple lines according to membership
            # TODO: Account for payment membership differences (single -> family)

            remaining_amount = abs(amount)

            payment_obj = None

            if (
                payment_type == PaymentType.DEBIT
                and found_accounts
                and any(
                    [
                        found_account_obj.category == AccountCategory.MEMBERSHIPS
                        for __, found_account_obj in found_accounts
                    ]
                )
                and found_user_obj
            ):
                payment_line_objs = list(
                    PaymentLine.objects.filter(
                        Q(
                            payment__status__in=(
                                PaymentStatus.PENDING,
                                PaymentStatus.PROCESSING,
                            )
                        )
                        | Q(payment__transaction=transaction_obj),
                        payment__type=PaymentType.DEBIT,
                        item_type=membership_module_type,
                        amount__in=[
                            account_amount for account_amount, __ in found_accounts
                        ],
                        membership_module__membership__users__id=found_user_obj.id,
                        membership_module__membership__date_to__gte=timezone.localdate(),
                    ).select_related("payment")
                )

                payment_amount = sum(
                    [payment_line_obj.amount for payment_line_obj in payment_line_objs]
                )

                if payment_line_objs and payment_amount <= remaining_amount:
                    found_accounts = [
                        (account_amount, account_obj)
                        for account_amount, account_obj in found_accounts
                        if account_obj.category != AccountCategory.MEMBERSHIPS
                    ]
                    # for payment_line_obj in payment_line_objs:
                    #     print(payment_line_obj, payment_line_obj.membership_module)
                    #     found_accounts.remove((payment_line_obj.amount.amount, account_membership_by_code[MEMBERSHIP_ACCOUNT_BY_MODULE_AND_AMOUNT[payment_line_obj.membership_module.module][payment_line_obj.amount.amount]]))

                    remaining_amount -= payment_amount

                    for payment_obj, __ in itertools.groupby(
                        payment_line_objs, lambda pl: pl.payment
                    ):
                        payment_obj.status = PaymentStatus.COMPLETED
                        payment_obj.method = method
                        payment_obj.text = text
                        payment_obj.transaction = transaction_obj
                        payment_obj.entity = found_entity_obj
                        payment_obj.save(
                            update_fields=(
                                "status",
                                "method",
                                "text",
                                "transaction",
                                "entity",
                            )
                        )

                    for membership_obj in Membership.objects.filter(
                        status__in=(
                            MembershipStatus.REQUESTED,
                            MembershipStatus.PROCESSING,
                        ),
                        modules__payment_lines__id__in=[
                            payment_line_obj.id
                            for payment_line_obj in payment_line_objs
                        ],
                    ):
                        membership_obj.status = MembershipStatus.ACTIVE
                        membership_obj.save(update_fields=("status",))

            if not payment_obj:
                # TODO: Link with existing payment based on similarity
                payment_obj, __ = Payment.objects.get_or_create(
                    type=payment_type,
                    status=PaymentStatus.COMPLETED,
                    method=method,
                    transaction=transaction_obj,
                    defaults={
                        "entity": found_entity_obj,
                        "text": text,
                    },
                )

            # TODO: Create only remaining amount for existing lines within same payment if more than one line ALREADY exists
            if remaining_amount.amount > 0:
                has_membership_payment = False
                for account_amount, account_obj in found_accounts:
                    current_amount = min(
                        Money(
                            amount=account_amount, currency=remaining_amount.currency
                        ),
                        remaining_amount,
                    )
                    payment_line_obj = PaymentLine.objects.update_or_create(
                        payment=payment_obj,
                        amount=current_amount,
                        vat=vat,
                        defaults={
                            "account": account_obj,
                        },
                    )

                    if account_obj.category == AccountCategory.MEMBERSHIPS:
                        has_membership_payment = True

                    remaining_amount -= current_amount
                    if remaining_amount.amount <= 0:
                        break
                if remaining_amount.amount > 0:
                    payment_line_obj = PaymentLine.objects.update_or_create(
                        payment=payment_obj,
                        amount=abs(amount),
                        vat=vat,
                    )

                if has_membership_payment and found_user_obj:
                    family_id = None
                    if hasattr(found_user_obj, "family_member"):
                        family_id = found_user_obj.family_member.family.id

                    membership.api.create_or_update(
                        user_id=found_user_obj.id,
                        modules=list(
                            set(
                                [
                                    account_obj.module
                                    for __, account_obj in found_accounts
                                ]
                            )
                        ),
                        family_id=family_id,
                    )

        transaction_import_obj.status = TransactionImportStatus.COMPLETED
    except KeyError:
        transaction_import_obj.status = TransactionImportStatus.ERRORED

    transaction_import_obj.save(update_fields=("status",), run=False)

    return transaction_objs
