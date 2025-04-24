from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing users.
    Only Platform Admins can access this viewset.
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsPlatformAdmin]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Return the total count of users
        """
        count = User.objects.count()
        return Response({'count': count})


class WarehouseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing warehouses.
    All admin roles can access, but only owners or platform admins can edit/delete.
    """
    queryset = Warehouse.objects.all().order_by('-created_at')
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminUser]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser, IsOwnerOrAdmin]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        Return the total count of warehouses
        """
        count = Warehouse.objects.count()
        return Response({'count': count})


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing announcements.
    All admin roles can access, but only owners or platform admins can edit/delete.
    """
    queryset = Announcement.objects.all().order_by('-created_at')
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminUser]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser, IsOwnerOrAdmin]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Return the most recent announcements (limit by query param)
        """
        limit = int(request.query_params.get('limit', 5))
        announcements = Announcement.objects.filter(is_active=True).order_by('-created_at')[:limit]
        serializer = self.get_serializer(announcements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """
        Toggle the is_active status of an announcement
        """
        announcement = self.get_object()
        announcement.is_active = not announcement.is_active
        announcement.save()
        serializer = self.get_serializer(announcement)
        return Response(serializer.data)