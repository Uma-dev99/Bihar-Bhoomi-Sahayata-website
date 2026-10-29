from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from enquiries.views import health_check

admin.site.site_header = "Bihar Bhoomi Sahayata - Enquiries"
admin.site.site_title = "Bihar Bhoomi Sahayata admin"
admin.site.index_title = "Manage enquiries"

urlpatterns = [
    path(settings.ADMIN_URL_PATH, admin.site.urls),
    path("api/health/", health_check, name="health"),
    path("api/", include("enquiries.urls")),
]
