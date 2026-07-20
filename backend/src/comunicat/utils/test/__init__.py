from typing import Iterable, TypeVar
from unittest import mock

from django.db import models, transaction

ModelT = TypeVar("ModelT", bound=models.Model)


def run_commit_hooks(databases: Iterable = ("default",)):
    for db_name in databases:
        with mock.patch(
            "django.db.backends.base.base.BaseDatabaseWrapper"
            ".validate_no_atomic_block",
            lambda a: False,
        ):
            transaction.get_connection(using=db_name).run_and_clear_commit_hooks()


def get_fresh(obj: ModelT) -> ModelT:
    return type(obj).objects.get(pk=obj.pk)
