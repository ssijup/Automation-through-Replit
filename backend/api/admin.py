from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Warehouse, Announcement

# Register custom User model with the admin site
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )

# Register Warehouse model
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('city', 'latitude', 'longitude', 'created_at', 'created_by')
    search_fields = ('city',)
    list_filter = ('created_at',)

# Register Announcement model
@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'created_by', 'is_active')
    search_fields = ('title', 'content')
    list_filter = ('created_at', 'is_active')
