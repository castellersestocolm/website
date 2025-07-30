from django.apps import apps
from django.db.models import (
    QuerySet,
    Sum,
    OuterRef,
    Subquery,
    Value,
    IntegerField,
    F,
    Q,
    Case,
    When,
)
from django.db.models.functions import Coalesce, Cast
from django.utils import translation

from comunicat.enums import Module
from comunicat.utils.managers import MoneyOutput
from order.enums import OrderStatus


class ProductQuerySet(QuerySet):
    def with_stock(self):
        StockProduct = apps.get_model("product", "StockProduct")
        OrderProduct = apps.get_model("order", "OrderProduct")

        return self.annotate(
            stock_in=Coalesce(
                Subquery(
                    StockProduct.objects.filter(size__product_id=OuterRef("id"))
                    .values("size__product")
                    .annotate(sum=Sum("amount"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock_out=Coalesce(
                Subquery(
                    OrderProduct.objects.filter(size__product_id=OuterRef("id"))
                    .exclude(
                        order__status__in=(OrderStatus.CANCELLED, OrderStatus.ABANDONED)
                    )
                    .values("size__product")
                    .annotate(sum=Sum("quantity"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock_out_pending=Coalesce(
                Subquery(
                    OrderProduct.objects.filter(
                        size__product_id=OuterRef("id"),
                        order__status__in=(OrderStatus.CREATED, OrderStatus.PROCESSING),
                    )
                    .values("size__product")
                    .annotate(sum=Sum("quantity"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock=F("stock_in") - F("stock_out"),
        )

    def with_price(self, modules: list[Module] | None = None):
        ProductSize = apps.get_model("product", "ProductSize")

        return self.annotate(
            price_min=Coalesce(
                Subquery(
                    ProductSize.objects.filter(product_id=OuterRef("id"))
                    .with_price(modules=modules)
                    .order_by("price")
                    .values_list("price", flat=True)[:1],
                ),
                Value(None),
                output_field=MoneyOutput(),
            ),
            price_max=Coalesce(
                Subquery(
                    ProductSize.objects.filter(product_id=OuterRef("id"))
                    .with_price(modules=modules)
                    .order_by("-price")
                    .values_list("price", flat=True)[:1],
                ),
                Value(None),
                output_field=MoneyOutput(),
            ),
            price=F("price_min"),
        )

    def with_name(self, locale: str | None = None):
        locale = locale or translation.get_language()

        return self.annotate(
            name_locale=F(f"name__{locale}"),
        )


class ProductSizeQuerySet(QuerySet):
    def with_stock(self):
        StockProduct = apps.get_model("product", "StockProduct")
        OrderProduct = apps.get_model("order", "OrderProduct")

        return self.annotate(
            stock_in=Coalesce(
                Subquery(
                    StockProduct.objects.filter(size_id=OuterRef("id"))
                    .values("size__product")
                    .annotate(sum=Sum("amount"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock_out=Coalesce(
                Subquery(
                    OrderProduct.objects.filter(size_id=OuterRef("id"))
                    .exclude(
                        order__status__in=(OrderStatus.CANCELLED, OrderStatus.ABANDONED)
                    )
                    .values("size__product")
                    .annotate(sum=Sum("quantity"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock_out_pending=Coalesce(
                Subquery(
                    OrderProduct.objects.filter(
                        size_id=OuterRef("id"),
                        order__status__in=(OrderStatus.CREATED, OrderStatus.PROCESSING),
                    )
                    .values("size__product")
                    .annotate(sum=Sum("quantity"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock=F("stock_in") - F("stock_out"),
        )

    def with_price(self, modules: list[Module] | None = None):
        ProductPrice = apps.get_model("product", "ProductPrice")

        product_price_filter = (Q(size__isnull=True) | Q(size_id=OuterRef("id"))) & Q(
            product_id=OuterRef("product_id")
        )

        if modules:
            product_price_filter &= Q(module__isnull=True) | Q(module__in=modules)
        else:
            product_price_filter &= Q(module__isnull=True)

        return self.annotate(
            price=Coalesce(
                Subquery(
                    ProductPrice.objects.filter(product_price_filter)
                    .order_by("amount")
                    .values_list("amount", flat=True)[:1],
                ),
                Value(None),
                output_field=MoneyOutput(),
            ),
            vat=Coalesce(
                Subquery(
                    ProductPrice.objects.filter(product_price_filter)
                    .order_by("amount")
                    .values_list("vat", flat=True)[:1],
                ),
                Value(None),
                output_field=IntegerField(),
            ),
            price_vat=Case(
                When(
                    price__isnull=False,
                    vat__isnull=False,
                    then=F("vat") * F("price") / 100,
                ),
                default=Value(None),
                output_field=MoneyOutput(),
            ),
        )
