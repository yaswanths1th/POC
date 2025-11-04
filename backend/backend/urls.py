from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
<<<<<<< HEAD
    # ✅ Rename Django admin to avoid route conflict
    path('', lambda request: HttpResponse("Welcome to the homepage")),
    # ... your other paths
=======
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)
    path('dj-admin/', admin.site.urls),

    # API routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/addresses/', include('apps.addresses.urls')),
    path('api/password-reset/', include('apps.password_reset.urls')),
    path('api/viewprofile/', include('apps.viewprofile.urls')),
    path('api/change-password/', include('apps.change_password.urls')),
    path("api/accounts/", include("apps.accounts.urls")),
]
