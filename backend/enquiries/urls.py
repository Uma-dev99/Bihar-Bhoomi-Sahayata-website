from django.urls import path

from .views import EnquiryCreateView

app_name = "enquiries"

urlpatterns = [
    path("enquiries/", EnquiryCreateView.as_view(), name="create"),
]
