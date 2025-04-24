from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Warehouse, Announcement


class CustomUserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role Information', {'fields': ('role',)}),
    )


class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('city', 'latitude', 'longitude', 'created_at', 'created_by')
    search_fields = ('city',)
    list_filter = ('created_at',)


class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'created_by', 'is_active')
    search_fields = ('title', 'content')
    list_filter = ('created_at', 'is_active')


admin.site.register(User, CustomUserAdmin)
admin.site.register(Warehouse, WarehouseAdmin)
admin.site.register(Announcement, AnnouncementAdmin)