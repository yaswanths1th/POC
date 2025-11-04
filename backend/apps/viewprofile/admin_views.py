# apps/viewprofile/admin_views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer

class AdminUserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # ✅ Only admins

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
