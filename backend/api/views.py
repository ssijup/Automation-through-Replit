from rest_framework import generics, permissions
from .models import User, Warehouse, Announcement
from .serializers import (
    UserSerializer,
    UserUpdateSerializer,
    WarehouseSerializer,
    AnnouncementSerializer
)
from .permissions import IsPlatformAdmin, IsAdminUser, IsOwnerOrAdmin


class CurrentUserView(generics.RetrieveAPIView):
    """
    API endpoint that returns the current user's details
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserCreateView(generics.CreateAPIView):
    """
    API endpoint for creating users (Platform Admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]


class UserListView(generics.ListAPIView):
    """
    API endpoint for listing users (Platform Admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a user (Platform Admin only)
    """
    queryset = User.objects.all()
    permission_classes = [IsPlatformAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserSerializer


class WarehouseListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating warehouses (All admin roles)
    """
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Warehouse.objects.all().order_by('-created_at')


class WarehouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a warehouse (All admin roles)
    """
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminUser, IsOwnerOrAdmin]


class AnnouncementListCreateView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating announcements (All admin roles)
    """
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Announcement.objects.all().order_by('-created_at')


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting an announcement (All admin roles)
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminUser, IsOwnerOrAdmin]