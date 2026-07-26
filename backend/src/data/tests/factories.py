from factory import LazyFunction, SubFactory
from factory.django import DjangoModelFactory

from comunicat.utils.factories import fake_string
from data.models import Country, Region, Zone


class ZoneFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = LazyFunction(lambda: fake_string(length=10).upper())

    class Meta:
        model = Zone


class CountryFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = LazyFunction(lambda: fake_string(length=3).upper())
    code_mapping = None

    zone = SubFactory(ZoneFactory)

    is_starred = False

    class Meta:
        model = Country


class RegionFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = LazyFunction(lambda: fake_string(length=10).upper())

    country = SubFactory(CountryFactory)
    country_code_mapping = None

    class Meta:
        model = Region
