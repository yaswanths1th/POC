# apps/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import register_user, profile_view, CustomTokenObtainPairView, list_all_users
from .views import (
    register_user, profile_view, CustomTokenObtainPairView,
    list_all_users, get_user_details
)
from .views import get_user_details, AdminUpdateUserAPIView

urlpatterns = [
    # ✅ Custom login view (includes is_admin flag)
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # ✅ Refresh token
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ✅ Register and Profile
    path("register/", register_user, name="register_user"),
    path("profile/", profile_view, name="profile_view"),

    # ✅ NEW: User list for ManageUsers.jsx
    path("all-users/", list_all_users, name="list_all_users"),
    path("user/<int:user_id>/", get_user_details, name="get_user_details"),
    path("delete-user/<int:user_id>/", views.delete_user, name="delete_user"),
    path('user/<int:user_id>/', get_user_details),        # GET user details
    path('user/<int:user_id>/update/', AdminUpdateUserAPIView.as_view()),  # PUT admin update

]
