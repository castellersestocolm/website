from typing import List
from uuid import UUID

from django.db.models import Prefetch

from comunicat.enums import Module
from product.models import Product, ProductImage, ProductSize
from user.models import User


def get_list(module: Module, user_id: UUID | None = None) -> List[Product]:
    if user_id:
        user_obj = User.objects.filter(id=user_id).with_has_active_membership().first()
        modules = [
            module
            for module in Module
            if getattr(user_obj, f"membership_{module}", False)
        ]
    else:
        modules = []

    return list(
        Product.objects.prefetch_related(
            Prefetch(
                "sizes",
                ProductSize.objects.with_stock()
                .with_price(modules=modules)
                .order_by("order", "category", "size"),
            ),
            Prefetch("images", ProductImage.objects.all().order_by("created_at")),
            "prices",
        )
        .with_stock()
        .with_price(modules=modules)
        .order_by("type", "created_at")
    )
