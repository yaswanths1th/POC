from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
<<<<<<< HEAD
from . import views
from .views import register_user, profile_view, CustomTokenObtainPairView, list_all_users
from .views import (
    register_user, profile_view, CustomTokenObtainPairView,
    list_all_users, get_user_details
=======
from .views import (
    register_user,
    profile_view,
    CustomTokenObtainPairView,
    AdminUserListCreateAPIView,
    AdminUserUpdateDeleteAPIView,
    AdminUserStatsAPIView,
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)
)

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("register/", register_user, name="register_user"),
    path("profile/", profile_view, name="profile_view"),

<<<<<<< HEAD
    # ✅ NEW: User list for ManageUsers.jsx
    path("all-users/", list_all_users, name="list_all_users"),
    path("user/<int:user_id>/", get_user_details, name="get_user_details"),
=======
    # Admin user management
    path("admin/users/", AdminUserListCreateAPIView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", AdminUserUpdateDeleteAPIView.as_view(), name="admin-user-detail"),
    path("admin/stats/", AdminUserStatsAPIView.as_view(), name="admin-user-stats"),
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)
]
