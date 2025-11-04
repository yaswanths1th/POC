from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('dj-admin/', admin.site.urls),

    # API routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/addresses/', include('apps.addresses.urls')),
    path('api/password-reset/', include('apps.password_reset.urls')),
    path('api/viewprofile/', include('apps.viewprofile.urls')),
    path('api/change-password/', include('apps.change_password.urls')),
]
