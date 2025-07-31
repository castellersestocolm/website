from rest_framework import filters


class TestFilter(filters.OrderingFilter):
    def filter_queryset(self, request, queryset, view):
        print(queryset)
        return queryset
