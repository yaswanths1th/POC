# apps/viewprofile/urls.py
from django.urls import path
from .views import ProfileAPIView
from .admin_views import AdminUserListCreateView, AdminUserDetailView

urlpatterns = [
    path("auth/profile/", ProfileAPIView.as_view(), name="user-profile"),

    # ✅ Correct admin user management endpoints
    path("admin/users/", AdminUserListCreateView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
