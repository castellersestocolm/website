from django.apps import apps
from django.db.models import (
    QuerySet,
    Sum,
    OuterRef,
    Subquery,
    Value,
    IntegerField,
    F,
)
from django.db.models.functions import Coalesce

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
                    .exclude(order__status=OrderStatus.CANCELLED)
                    .values("size__product")
                    .annotate(sum=Sum("quantity"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock=F("stock_in") - F("stock_out"),
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
                    .exclude(order__status=OrderStatus.CANCELLED)
                    .values("size__product")
                    .annotate(sum=Sum("quantity"))
                    .values_list("sum", flat=True)[:1],
                ),
                Value(0),
                output_field=IntegerField(),
            ),
            stock=F("stock_in") - F("stock_out"),
        )
