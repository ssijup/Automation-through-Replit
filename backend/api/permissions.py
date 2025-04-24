from rest_framework import permissions

class IsPlatformAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to platform admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_platform_admin())

class IsAdminUser(permissions.BasePermission):
    """
    Permission class that allows access to any admin role (Platform Admin, Support Staff, Warehouse Admin).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_platform_admin() or 
            request.user.is_support_staff() or 
            request.user.is_warehouse_admin()
        ))

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any admin
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated and (
                request.user.is_platform_admin() or 
                request.user.is_support_staff() or 
                request.user.is_warehouse_admin()
            ))

        # Write permissions are only allowed to the owner or platform admin
        created_by_field = getattr(obj, 'created_by', None)
        return bool(
            (created_by_field and request.user == created_by_field) or 
            request.user.is_platform_admin()
        )
