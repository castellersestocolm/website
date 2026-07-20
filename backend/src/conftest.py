import logging
from types import TracebackType
from typing import Callable, Optional, Protocol, TypeVar

import django
from django.db import DEFAULT_DB_ALIAS, connections, models
from django.db.backends.base.base import BaseDatabaseWrapper
from django.test.utils import CaptureQueriesContext

django.setup()

pytest_plugins = ["comunicat.utils.test.fixtures", "comunicat.utils.test.mocks"]

logging.getLogger("factory").setLevel(logging.WARNING)

ModelT = TypeVar("ModelT", bound=models.Model)


class TestCaseLike(Protocol):
    subTest: Callable
    assertEqual: Callable


ExcT = TypeVar("ExcT", bound=BaseException)


class _AssertNumOperationsContext(CaptureQueriesContext):
    def __init__(
        self,
        test_case: TestCaseLike,
        connection: BaseDatabaseWrapper,
        num_selects: int | None = None,
        num_inserts: int | None = None,
        num_updates: int | None = None,
        num_deletes: int | None = None,
    ) -> None:
        self.test_case = test_case
        self.num_selects = num_selects
        self.num_inserts = num_inserts
        self.num_updates = num_updates
        self.num_deletes = num_deletes
        super().__init__(connection)

    def __exit__(
        self,
        exc_type: type[ExcT] | None = None,
        exc_val: ExcT | None = None,
        exc_tb: TracebackType | None = None,
    ) -> None:
        if exc_val:  # pragma: no cover
            return None

        for expected, operation in (
            (self.num_selects, "SELECT"),
            (self.num_inserts, "INSERT"),
            (self.num_updates, "UPDATE"),
            (self.num_deletes, "DELETE"),
        ):
            if expected is None:
                continue

            queries = [
                q["sql"]
                for q in self.captured_queries
                if q["sql"].startswith(operation)
            ]
            executed = len(queries)
            query_list = "\n".join(
                f"{i}. {sql}" for i, sql in enumerate(queries, start=1)
            )

            self.test_case.assertEqual(
                executed,
                expected,
                f"{executed} {operation}S executed, {expected} expected\nCaptured queries were:\n{query_list}",
            )


class NumOperationsMixin:
    subTest: Callable
    assertEqual: Callable

    def assertNumOperations(
        self,
        *,
        num_selects: Optional[int] = None,
        num_inserts: Optional[int] = None,
        num_updates: Optional[int] = None,
        num_deletes: Optional[int] = None,
        using: str = DEFAULT_DB_ALIAS,
    ) -> _AssertNumOperationsContext:
        if all(
            [
                num_selects is None,
                num_inserts is None,
                num_updates is None,
                num_deletes is None,
            ]
        ):  # pragma: no cover
            raise ValueError(
                "Set at least one of num_selects, num_updates, num_inserts, num_updates"
            )
        return _AssertNumOperationsContext(
            self,
            connections[using],
            num_selects=num_selects,
            num_inserts=num_inserts,
            num_updates=num_updates,
            num_deletes=num_deletes,
        )
