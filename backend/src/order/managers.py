from django.apps import apps
from django.db.models import (
    Case,
    CharField,
    F,
    OuterRef,
    Prefetch,
    QuerySet,
    Subquery,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Cast, Coalesce, Concat
from django.utils import translation

from comunicat.utils.managers import MoneyOutput
from order.enums import OrderStatus, OrderType


class OrderQuerySet(QuerySet):
    def with_amount(self):
        OrderProduct = apps.get_model("order", "OrderProduct")
        OrderRegistration = apps.get_model("order", "OrderRegistration")
        OrderMembership = apps.get_model("order", "OrderMembership")
        OrderCourse = apps.get_model("order", "OrderCourse")

        return self.annotate(
            amount_items=Case(
                When(
                    type=OrderType.PRODUCT,
                    then=Coalesce(
                        Subquery(
                            OrderProduct.objects.filter(order_id=OuterRef("id"))
                            .values("order_id")
                            .annotate(amount=Sum("amount"))
                            .values("amount")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                When(
                    type=OrderType.REGISTRATION,
                    then=Coalesce(
                        Subquery(
                            OrderRegistration.objects.filter(order_id=OuterRef("id"))
                            .values("order_id")
                            .annotate(amount=Sum("amount"))
                            .values("amount")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                When(
                    type=OrderType.MEMBERSHIP,
                    then=Coalesce(
                        Subquery(
                            OrderMembership.objects.filter(order_id=OuterRef("id"))
                            .values("order_id")
                            .annotate(amount=Sum("amount"))
                            .values("amount")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                When(
                    type=OrderType.COURSE,
                    then=Coalesce(
                        Subquery(
                            OrderCourse.objects.filter(order_id=OuterRef("id"))
                            .values("order_id")
                            .annotate(amount=Sum("amount"))
                            .values("amount")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                default=Value(0),
                output_field=MoneyOutput(),
            ),
            amount_items_vat=Case(
                When(
                    type=OrderType.PRODUCT,
                    then=Coalesce(
                        Subquery(
                            OrderProduct.objects.filter(order_id=OuterRef("id"))
                            .with_amount()
                            .values("order_id")
                            .annotate(amount_vat=Sum("amount_vat"))
                            .values("amount_vat")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                When(
                    type=OrderType.REGISTRATION,
                    then=Coalesce(
                        Subquery(
                            OrderRegistration.objects.filter(order_id=OuterRef("id"))
                            .with_amount()
                            .values("order_id")
                            .annotate(amount_vat=Sum("amount_vat"))
                            .values("amount_vat")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                When(
                    type=OrderType.MEMBERSHIP,
                    then=Coalesce(
                        Subquery(
                            OrderMembership.objects.filter(order_id=OuterRef("id"))
                            .with_amount()
                            .values("order_id")
                            .annotate(amount_vat=Sum("amount_vat"))
                            .values("amount_vat")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                When(
                    type=OrderType.COURSE,
                    then=Coalesce(
                        Subquery(
                            OrderCourse.objects.filter(order_id=OuterRef("id"))
                            .with_amount()
                            .values("order_id")
                            .annotate(amount_vat=Sum("amount_vat"))
                            .values("amount_vat")[:1]
                        ),
                        Value(0),
                        output_field=MoneyOutput(),
                    ),
                ),
                default=Value(0),
                output_field=MoneyOutput(),
            ),
            amount_delivery=Coalesce(
                F("delivery__amount"), Value(0), output_field=MoneyOutput()
            ),
            amount_delivery_vat=Coalesce(
                F("delivery__vat") * F("delivery__amount") / 100,
                Value(0),
                output_field=MoneyOutput(),
            ),
            amount=Cast(
                F("amount_items") + F("amount_delivery"),
                output_field=MoneyOutput(),
            ),
            amount_vat=Cast(
                F("amount_items_vat") + F("amount_delivery_vat"),
                output_field=MoneyOutput(),
            ),
        )

    def with_products_pending(self):
        OrderProduct = apps.get_model("order", "OrderProduct")

        return self.prefetch_related(
            Prefetch(
                "products",
                OrderProduct.objects.filter(
                    quantity_given__lt=F("quantity"),
                )
                .select_related("size", "size__product")
                .order_by("size__product__type", "size__product__created_at"),
                to_attr="products_pending",
            ),
        )


class OrderProductQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(amount_vat=F("vat") * F("amount") / 100)

    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"size__product__name__{locale}"),
        )

    def with_description(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            description_locale=F(f"size__product__description__{locale}"),
        )


class OrderRegistrationQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(amount_vat=F("vat") * F("amount") / 100)


class OrderMembershipQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(amount_vat=F("vat") * F("amount") / 100)

    def with_amount_pending(self):
        OrderMembership = apps.get_model("order", "OrderMembership")

        return self.annotate(
            amount_paid=Coalesce(
                Subquery(
                    OrderMembership.objects.filter(
                        module_id=OuterRef("module_id"),
                        order__status__gte=OrderStatus.REQUESTED,
                    )
                    .values("order_id")
                    .annotate(amount=Sum("amount"))
                    .values("amount")[:1]
                ),
                Value(0),
                output_field=MoneyOutput(),
            ),
            amount_pending=F("amount") - F("amount_paid"),
        )


class OrderCourseQuerySet(QuerySet):
    def with_amount(self):
        return self.annotate(amount_vat=F("vat") * F("amount") / 100)


class DeliveryPriceQuerySet(QuerySet):
    def with_price(self):
        return self.annotate(
            price_vat=Case(
                When(
                    price__isnull=False,
                    vat__isnull=False,
                    then=Concat(
                        Cast(F("vat") * F("price") / 100, output_field=CharField()),
                        Value(";"),
                        Cast(F("price_currency"), output_field=CharField()),
                    ),
                ),
                default=Value(None),
                output_field=MoneyOutput(),
            ),
        )
