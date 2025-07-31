from rest_framework.permissions import IsAuthenticated

from legal.enums import PermissionLevel


class AllowLevelUser(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request=request, view=view)
            and request.user.permission_level >= PermissionLevel.USER
        )


class AllowLevelAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request=request, view=view)
            and request.user.permission_level >= PermissionLevel.ADMIN
        )


class AllowLevelSuperAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request=request, view=view)
            and request.user.permission_level >= PermissionLevel.SUPERADMIN
        )
