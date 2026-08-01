from django.conf import settings

from comunicat.enums import Module

GOOGLE_DRIVE_BY_MODULE = {
    module: getattr(settings, f"MODULE_{Module(module).name}_GOOGLE_DRIVE")["activity"]
    for module in Module
}
