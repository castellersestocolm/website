from factory import Sequence, SubFactory
from factory.django import DjangoModelFactory

from data.models import Country, Region, Zone


class ZoneFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = Sequence(lambda n: f"Z{n}")

    class Meta:
        model = Zone


class CountryFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = Sequence(lambda n: f"C{n}")
    code_mapping = None

    zone = SubFactory(ZoneFactory)

    is_starred = False

    class Meta:
        model = Country


class RegionFactory(DjangoModelFactory):
    # name = LazyFunction(fake_title)
    code = Sequence(lambda n: f"R{n}")

    country = SubFactory(CountryFactory)
    country_code_mapping = None

    class Meta:
        model = Region
