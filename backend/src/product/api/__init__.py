from typing import List

from django.db.models import Prefetch

from comunicat.enums import Module
from product.models import Product, ProductImage


def get_list(module: Module) -> List[Product]:
    return list(
        Product.objects.prefetch_related(
            "sizes",
            Prefetch("images", ProductImage.objects.all().order_by("created_at")),
            "prices",
        )
        .with_stock()
        .order_by("type", "created_at")
    )
