from django.urls import path
from .views import ProfileAPIView,AdminUserListCreateAPIView, AdminUserUpdateDeleteAPIView
from . import admin_views
urlpatterns = [
    path("auth/profile/", ProfileAPIView.as_view(), name="user-profile"),
     # ✅ Admin user management
    path('admin/users/', AdminUserListCreateAPIView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserUpdateDeleteAPIView.as_view(), name='admin-user-detail'),
]