from django.contrib import admin, messages
from django.utils.html import format_html

from .choices import Status
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "phone", "service_type", "district", "preferred_language", "status")
    list_display_links = ("created_at", "name")
    list_editable = ("status",)
    list_filter = ("status", "service_type", "preferred_language", "district", "created_at")
    search_fields = ("name", "phone")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    list_per_page = 50
    actions = ("mark_contacted", "mark_closed")
    show_full_result_count = False

    fieldsets = (
        ("Status", {"fields": ("status", "created_at")}),
        ("Customer", {"fields": ("name", "phone", "contact_links", "preferred_language", "district")}),
        ("Request", {"fields": ("service_type", "message")}),
    )

    def get_readonly_fields(self, request, obj=None):
        # What the customer submitted is kept as submitted; only the status changes.
        if obj is None:
            return ("created_at", "contact_links")
        return (
            "created_at",
            "contact_links",
            "name",
            "phone",
            "preferred_language",
            "district",
            "service_type",
            "message",
        )

    @admin.display(description="Call / WhatsApp")
    def contact_links(self, obj):
        if not obj or not obj.phone:
            return "-"
        digits = obj.phone.lstrip("+")
        return format_html(
            '<a href="tel:{}">Call</a> &nbsp;|&nbsp; '
            '<a href="https://wa.me/{}" target="_blank" rel="noopener noreferrer">WhatsApp</a>',
            obj.phone,
            digits,
        )

    @admin.action(description="Mark selected as contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status=Status.CONTACTED)
        self.message_user(request, f"{updated} enquiry(ies) marked as contacted.", messages.SUCCESS)

    @admin.action(description="Mark selected as closed")
    def mark_closed(self, request, queryset):
        updated = queryset.update(status=Status.CLOSED)
        self.message_user(request, f"{updated} enquiry(ies) marked as closed.", messages.SUCCESS)

    def has_delete_permission(self, request, obj=None):
        # Deleting customer data is reserved for the owner's superuser account,
        # e.g. to honour a deletion request under the privacy notice.
        return request.user.is_superuser
