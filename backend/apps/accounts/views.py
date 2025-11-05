# apps/accounts/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework import status, permissions
from rest_framework.views import APIView


# 🧩 Register new user
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_user(request):
    user = request.user
    data = request.data

    # Admin can create a user
    is_admin = user.is_superuser or user.is_staff
    if not is_admin:
        return Response({"detail": "Permission denied. Admins only."}, status=403)

    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        new_user = serializer.save()

        # ✅ If admin provides address data, save it
        address_data = data.get("address")
        if address_data:
            from addresses.models import Address
            Address.objects.create(user=new_user, **address_data)

        return Response({"message": "User registered successfully!", "id": new_user.id}, status=201)
    return Response(serializer.errors, status=400)

# 🧠 Profile view/update (for logged-in user)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ✅ Custom JWT Login
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        data.update({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
            "is_admin": user.is_superuser or user.is_staff,
        })

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# 🧾 Admin Endpoint: Fetch All Users
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_users(request):
    """
    Fetch all users for Admin Dashboard or ManageUsers page.
    Accessible to all authenticated users for display,
    but only superusers can see all users.
    """
    user = request.user

    # ✅ Print to debug token (optional)
    print("🔐 Authenticated user:", user.username)
    print("🧩 is_superuser:", user.is_superuser)

    # ✅ Only allow admins to view everyone
    if not user.is_superuser:
        # Regular users can still fetch only themselves (optional)
        serialized = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_active": user.is_active,
            "date_joined": user.date_joined,
        }
        return Response([serialized], status=status.HTTP_200_OK)

    # ✅ If admin → return all users
    users = User.objects.all().order_by('-date_joined')
    serialized = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_superuser": u.is_superuser,
            "is_active": u.is_active,
            "date_joined": u.date_joined,
        }
        for u in users
    ]
    return Response(serialized, status=status.HTTP_200_OK)


# 🧍‍♂️ NEW: Fetch Single User Details by ID
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)
# 🗑️ Admin Endpoint: Delete User
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    user = request.user

    # ✅ Only admins can delete users
    if not user.is_superuser:
        return Response({"detail": "Permission denied. Admins only."},
                        status=status.HTTP_403_FORBIDDEN)

    try:
        user_to_delete = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # ✅ Prevent self-deletion
    if user_to_delete == user:
        return Response({"detail": "You cannot delete your own account."},
                        status=status.HTTP_400_BAD_REQUEST)

    user_to_delete.delete()
    return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AdminUpdateUserAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Keep as authenticated

    def put(self, request, user_id):
        user = request.user
        if not (user.is_superuser or user.is_staff):
            return Response({"detail": "Permission denied. Admins only."}, status=403)

        try:
            user_to_update = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        serializer = UserSerializer(user_to_update, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
