# apps/viewprofile/urls.py
from django.urls import path
<<<<<<< HEAD
from .views import (
    ProfileAPIView,
    AdminUserListCreateAPIView,
    AdminUserUpdateDeleteAPIView,
    UserDetailByIdAPIView,  # add this
)
from . import admin_views

urlpatterns = [
    path("auth/profile/", ProfileAPIView.as_view(), name="user-profile"),
    path("auth/profile/<int:user_id>/", UserDetailByIdAPIView.as_view(), name="user-profile-by-id"),
    # ✅ Admin user management
    path("admin/users/", AdminUserListCreateAPIView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", AdminUserUpdateDeleteAPIView.as_view(), name="admin-user-detail"),
=======
from .views import ProfileAPIView
from .admin_views import AdminUserListCreateView, AdminUserDetailView

urlpatterns = [
    path("auth/profile/", ProfileAPIView.as_view(), name="user-profile"),

    # ✅ Correct admin user management endpoints
    path("admin/users/", AdminUserListCreateView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)
]
