from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register_user,
    profile_view,
    CustomTokenObtainPairView,
    AdminUserListCreateAPIView,
    AdminUserUpdateDeleteAPIView,
    AdminUserStatsAPIView,
)

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("register/", register_user, name="register_user"),
    path("profile/", profile_view, name="profile_view"),

    # Admin user management
    path("admin/users/", AdminUserListCreateAPIView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", AdminUserUpdateDeleteAPIView.as_view(), name="admin-user-detail"),
    path("admin/stats/", AdminUserStatsAPIView.as_view(), name="admin-user-stats"),
]
