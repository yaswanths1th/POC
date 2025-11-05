from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Address
from .serializers import AddressSerializer

# Custom permission for superuser/staff
class IsAdminOrSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

# List / Create addresses
class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get("user")
        if user_id:
            return Address.objects.filter(user__id=user_id)
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Use 'user' if provided (admin), otherwise request.user
        user_id = self.request.data.get("user")
        if user_id:
            serializer.save(user_id=user_id)
        else:
            serializer.save(user=self.request.user)

# Retrieve / Update own address
class AddressRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

# Admin update any address
class AdminUpdateAddressAPIView(generics.RetrieveUpdateAPIView):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [IsAdminOrSuperUser]

# Check if user has address
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def check_address(request):
    has_address = Address.objects.filter(user=request.user).exists()
    return Response({"has_address": has_address})
