from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CurrentUserView,
    UserViewSet,
    WarehouseViewSet,
    AnnouncementViewSet
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'announcements', AnnouncementViewSet)

urlpatterns = [
    # Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User endpoints
    path('current-user/', CurrentUserView.as_view(), name='current_user'),
    
    # Include ViewSet routed endpoints
    path('', include(router.urls)),
    
    # Custom action URLs (these are just examples, as router already handles these)
    path('warehouses/count/', WarehouseViewSet.as_view({'get': 'count'}), name='warehouse_count'),
    path('users/count/', UserViewSet.as_view({'get': 'count'}), name='user_count'),
    path('announcements/recent/', AnnouncementViewSet.as_view({'get': 'recent'}), name='recent_announcements'),
    path('announcements/<int:pk>/toggle-status/', AnnouncementViewSet.as_view({'patch': 'toggle_status'}), name='toggle_announcement_status'),
]