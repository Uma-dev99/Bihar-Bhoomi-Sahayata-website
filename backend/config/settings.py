"""
Django settings for Bihar Bhoomi Sahayata.

One settings file is used for every environment. Anything that differs between
your laptop, staging and production comes from environment variables, so the
development and production configuration cannot quietly drift apart.

Secure defaults: if a variable is missing, the safer choice wins
(DEBUG is off, no hosts are allowed, HTTPS protections are on when DEBUG is off).
"""

import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv(path: Path) -> None:
    """Read KEY=VALUE lines from backend/.env for local development.

    Real environment variables always win, so hosting platforms and Jenkins
    are never overridden by a stray .env file.
    """
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


# --------------------------------------------------------------------------
# Core
# --------------------------------------------------------------------------
DEBUG = env_bool("DJANGO_DEBUG", False)

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "dev-only-insecure-key-do-not-use-in-production"
    else:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is False.")

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1" if DEBUG else "")

# Render sets RENDER_EXTERNAL_HOSTNAME automatically; allow it so the health
# check and the public URL work without editing settings.
_render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if _render_host and _render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "enquiries",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --------------------------------------------------------------------------
# Database
# --------------------------------------------------------------------------
# Production and CI use PostgreSQL through DATABASE_URL (Supabase in production).
# A local SQLite file is allowed ONLY while DEBUG is on, so a quick start does
# not need PostgreSQL. Run the tests against PostgreSQL before deploying.
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
DB_SSL_REQUIRED = env_bool("DATABASE_SSL_REQUIRE", not DEBUG)

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=int(os.environ.get("DATABASE_CONN_MAX_AGE", "60")),
            conn_health_checks=True,
            ssl_require=DB_SSL_REQUIRED,
        )
    }
    # Fail fast instead of hanging when the database cannot be reached.
    DATABASES["default"].setdefault("OPTIONS", {})
    DATABASES["default"]["OPTIONS"].setdefault("connect_timeout", 10)
elif DEBUG:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    raise ImproperlyConfigured("DATABASE_URL must be set when DJANGO_DEBUG is False.")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Shared cache stored in the database. Rate limits must be shared by every
# Gunicorn worker; a per-process memory cache would let each worker count
# separately. Create the table with: python manage.py createcachetable
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "django_cache",
    }
}

# --------------------------------------------------------------------------
# Passwords, language, time
# --------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------
# Static files (Django admin CSS/JS), served by Whitenoise
# --------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
            if DEBUG
            else "whitenoise.storage.CompressedManifestStaticFilesStorage"
        )
    },
}

# --------------------------------------------------------------------------
# Admin URL - a non-default path reduces automated login attempts.
# It is NOT a security control on its own; strong passwords still matter.
# --------------------------------------------------------------------------
ADMIN_URL_PATH = os.environ.get("DJANGO_ADMIN_PATH", "manage-enquiries/").strip("/") + "/"

# --------------------------------------------------------------------------
# Django REST Framework
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    # The public API needs no login. Nothing is readable by default.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_THROTTLE_RATES": {
        "enquiry_burst": os.environ.get("ENQUIRY_RATE_BURST", "3/min"),
        "enquiry_sustained": os.environ.get("ENQUIRY_RATE_SUSTAINED", "10/day"),
    },
    # Number of trusted reverse proxies in front of Django (Render = 1).
    # Needed so rate limits use the visitor's IP, not the proxy's.
    "NUM_PROXIES": int(os.environ["DRF_NUM_PROXIES"]) if os.environ.get("DRF_NUM_PROXIES") else None,
    "EXCEPTION_HANDLER": "enquiries.exceptions.json_exception_handler",
}

# --------------------------------------------------------------------------
# CORS / CSRF
# --------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173" if DEBUG else "")
CORS_URLS_REGEX = r"^/api/.*$"
CORS_ALLOW_METHODS = ["POST", "OPTIONS"]
CORS_ALLOW_CREDENTIALS = False
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")

# --------------------------------------------------------------------------
# Production security
# --------------------------------------------------------------------------
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
    # The health check is called by the host over plain HTTP inside its network.
    SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_HSTS_SECONDS", "3600"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    X_FRAME_OPTIONS = "DENY"

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 60 * 60 * 8  # admin sessions expire after 8 hours
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# --------------------------------------------------------------------------
# Logging - to the console only (hosting platforms collect stdout).
# Application code never logs names, phone numbers or message text.
# --------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"plain": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "plain"}},
    "root": {"handlers": ["console"], "level": os.environ.get("DJANGO_LOG_LEVEL", "INFO")},
    "loggers": {
        # Request bodies are never logged; this only reports errors and paths.
        "django.request": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
}

# --------------------------------------------------------------------------
# Business rules
# --------------------------------------------------------------------------
# Default retention period used by the purge_old_enquiries command.
ENQUIRY_RETENTION_DAYS = int(os.environ.get("ENQUIRY_RETENTION_DAYS", "365"))

# Reject oversized request bodies early (the enquiry form is a few KB at most).
DATA_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024
