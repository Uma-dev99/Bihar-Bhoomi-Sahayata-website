from django.db import models

from .choices import District, Language, ServiceType, Status


class Enquiry(models.Model):
    """A consultation request submitted through the public website.

    Only what is needed to call the customer back is stored. Do not add
    Aadhaar numbers, bank details, documents or passwords to this model.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, help_text="Normalised, e.g. +919812345678")
    preferred_language = models.CharField(max_length=2, choices=Language.choices, default=Language.HINDI)
    service_type = models.CharField(max_length=20, choices=ServiceType.choices)
    district = models.CharField(max_length=20, choices=District.choices, blank=True, default="")
    message = models.TextField(max_length=2000)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.NEW, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "enquiry"
        verbose_name_plural = "enquiries"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(preferred_language__in=Language.values),
                name="enquiry_language_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(status__in=Status.values),
                name="enquiry_status_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(service_type__in=ServiceType.values),
                name="enquiry_service_type_valid",
            ),
        ]

    def __str__(self) -> str:
        # Shown in the admin; deliberately excludes the phone number.
        return f"#{self.pk} {self.name} ({self.get_service_type_display()})"
