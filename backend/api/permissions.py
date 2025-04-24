from rest_framework import permissions
from .models import User


class IsPlatformAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to platform admins.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_platform_admin()


class IsAdminUser(permissions.BasePermission):
    """
    Permission class that allows access to any admin role (Platform Admin, Support Staff, Warehouse Admin).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any admin
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Platform admins can do anything
        if request.user.is_platform_admin():
            return True
            
        # Otherwise, only allow if this object belongs to the user
        return hasattr(obj, 'created_by') and obj.created_by == request.user