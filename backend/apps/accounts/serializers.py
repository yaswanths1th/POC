from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.get('role', 'user')
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
        )
        user.role = role
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
<<<<<<< HEAD
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
        ]


# ✅ New Serializer for ManageUsers.jsx
class UserManagementSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'status', 'date_joined']

    def get_role(self, obj):
        return "Admin" if obj.is_superuser else "User"

    def get_status(self, obj):
        return "Active" if obj.is_active else "Inactive"
=======
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active']
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)
