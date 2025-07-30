import iso3166


COUNTRY_CODE_3_TO_CODE_2 = {
    code_3: country.alpha2 for code_3, country in iso3166.countries_by_alpha3.items()
}
COUNTRY_CODE_2_TO_CODE_3 = {
    code_2: country.alpha3 for code_2, country in iso3166.countries_by_alpha2.items()
}
