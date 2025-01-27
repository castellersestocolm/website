from rest_framework.routers import SimpleRouter


class UUIDRouter(SimpleRouter):
    def get_lookup_regex(self, viewset, lookup_prefix=""):
        if not hasattr(viewset, "lookup_value_regex"):
            viewset.lookup_value_regex = r"[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}"
        return super().get_lookup_regex(viewset, lookup_prefix)
