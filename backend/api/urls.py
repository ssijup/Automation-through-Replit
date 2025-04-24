from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CurrentUserView,
    UserCreateView,
    UserListView,
    UserDetailView,
    WarehouseListCreateView,
    WarehouseDetailView,
    AnnouncementListCreateView,
    AnnouncementDetailView
)

urlpatterns = [
    # Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User endpoints
    path('users/current/', CurrentUserView.as_view(), name='current_user'),
    path('users/create/', UserCreateView.as_view(), name='user_create'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    
    # Warehouse endpoints
    path('warehouses/', WarehouseListCreateView.as_view(), name='warehouse_list_create'),
    path('warehouses/<int:pk>/', WarehouseDetailView.as_view(), name='warehouse_detail'),
    
    # Announcement endpoints
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcement_list_create'),
    path('announcements/<int:pk>/', AnnouncementDetailView.as_view(), name='announcement_detail'),
]