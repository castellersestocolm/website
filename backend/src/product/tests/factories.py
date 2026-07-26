import random

from factory import LazyAttribute, LazyFunction, Sequence, SubFactory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyChoice

from comunicat.utils.factories import fake_string
from product.enums import ArticleSizeCategory, ArticleType
from product.models import Product, ProductSize


class ProductFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    # description = LazyFunction(fake_title)

    type = FuzzyChoice(ArticleType)

    weight_grams = LazyAttribute(lambda n: random.randint(50, 500))

    ignore_stock = False

    class Meta:
        model = Product


class ProductSizeFactory(DjangoModelFactory):
    product = SubFactory(ProductFactory)

    category = FuzzyChoice(ArticleSizeCategory)

    size = LazyFunction(lambda: fake_string(length=1).upper())
    order = Sequence(lambda n: n)

    class Meta:
        model = ProductSize
