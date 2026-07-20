import random

from django.conf import settings
from django.db.models import Case, IntegerField, Q, Value, When
from django.utils import translation

from comunicat.enums import Module
from document.enums import DocumentStatus, DocumentType
from document.models import Document


def get_list(
    module: Module,
    is_authenticated: bool = False,
    filter_types: list[DocumentType] | None = None,
    order_by: list[str] | None = None,
) -> list[Document]:
    document_filter = Q()
    document_exclude = Q()

    if not is_authenticated:
        document_exclude = ~(Q(file="") | Q(file=None))

    if filter_types is not None:
        document_filter &= Q(type__in=filter_types)

    document_objs = list(
        Document.objects.filter(
            document_filter, status=DocumentStatus.PUBLISHED, module=module
        )
        .exclude(document_exclude)
        .with_language_match()
        .order_by("code", "language_match", "-version")
        .distinct("code")
    )

    if order_by is not None:
        if "?" in order_by:
            random.shuffle(document_objs)
        else:
            document_objs = sorted(
                document_objs,
                key=lambda document_obj: (
                    [
                        getattr(document_obj, order_by_attr.lstrip("-"))
                        for order_by_attr in order_by
                    ]
                    if order_by
                    else document_obj.order
                ),
                # TODO: Fix this per attribute
                reverse=order_by
                and any([order_by_attr.startswith("-") for order_by_attr in order_by]),
            )
    else:
        document_objs = sorted(
            document_objs, key=lambda document_obj: document_obj.order
        )

    return document_objs
