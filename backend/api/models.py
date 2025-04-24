from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    Roles: PLATFORM_ADMIN, SUPPORT_STAFF, WAREHOUSE_ADMIN
    """
    class Role(models.TextChoices):
        PLATFORM_ADMIN = 'PLATFORM_ADMIN', _('Platform Admin')
        SUPPORT_STAFF = 'SUPPORT_STAFF', _('Support Staff')
        WAREHOUSE_ADMIN = 'WAREHOUSE_ADMIN', _('Warehouse Admin')
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.WAREHOUSE_ADMIN,
    )

    def is_platform_admin(self):
        return self.role == self.Role.PLATFORM_ADMIN
    
    def is_support_staff(self):
        return self.role == self.Role.SUPPORT_STAFF
    
    def is_warehouse_admin(self):
        return self.role == self.Role.WAREHOUSE_ADMIN


class Warehouse(models.Model):
    """
    Warehouse model with location information.
    """
    city = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_warehouses'
    )

    def __str__(self):
        return f"Warehouse in {self.city}"


class Announcement(models.Model):
    """
    Announcement model for system-wide notifications.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_announcements'
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
