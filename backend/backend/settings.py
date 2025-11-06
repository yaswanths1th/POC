import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv
# ---------- Base Directory ----------
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ---------- Core Settings ----------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key")

# ✅ Fixed DEBUG logic (True for development)
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

# ✅ Allow localhost and 127.0.0.1
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

CORS_ALLOW_ALL_ORIGINS = True
# ---------- Installed Apps ----------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Local apps
    "apps.accounts",
    "apps.addresses",
    "apps.password_reset",
    "apps.viewprofile",
    "apps.change_password",
]

# ---------- Middleware ----------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ✅ must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

# ---------- Root URLs ----------
ROOT_URLCONF = "backend.urls"

# ---------- Database ----------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "Login"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "root"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# ---------- Custom User Model ----------
AUTH_USER_MODEL = "accounts.User"

# ---------- REST Framework ----------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

# ---------- CORS Configuration ----------
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ["*"]
CORS_ALLOW_METHODS = ["*"]

# ---------- JWT Configuration ----------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 60))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ---------- Templates ----------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ---------- Static Files ----------
STATIC_URL = "/static/"

# ---------- Default Primary Key Field Type ----------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------- Email Configuration ----------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "janamahi2010@gmail.com"  # ✅ Replace with your Gmail
EMAIL_HOST_PASSWORD = "zeex topo acdn zsjq"  # ✅ App password only
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ---------- OTP Expiry ----------
OTP_EXPIRY_MINUTES = 5
