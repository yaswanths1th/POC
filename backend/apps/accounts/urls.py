# apps/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import register_user, profile_view, CustomTokenObtainPairView

urlpatterns = [
    # ✅ Custom login view (includes is_admin flag)
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # ✅ Refresh token
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ✅ Register and Profile
    path("register/", register_user, name="register_user"),
    path("profile/", profile_view, name="profile_view"),
]
