from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Warehouse, Announcement


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ("id", "username", "password", "password2", "email", "first_name", "last_name", "role")
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": True}
        }
    
    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=validated_data.get("role", User.Role.WAREHOUSE_ADMIN)
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role")
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
        }


class WarehouseSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source="created_by.username")
    
    class Meta:
        model = Warehouse
        fields = ("id", "city", "latitude", "longitude", "created_at", "updated_at", "created_by", "created_by_username")
        read_only_fields = ("created_at", "updated_at", "created_by")
    
    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField(source="created_by.username")
    
    class Meta:
        model = Announcement
        fields = ("id", "title", "content", "created_at", "updated_at", "created_by", "created_by_username", "is_active")
        read_only_fields = ("created_at", "updated_at", "created_by")
    
    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)