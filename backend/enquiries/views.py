import logging
import os

from django.db import DatabaseError, connection
from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from .permissions import CreateOnly
from .serializers import EnquiryCreateSerializer
from .throttles import EnquiryBurstThrottle, EnquirySustainedThrottle

logger = logging.getLogger(__name__)

# Hidden form field that real people never see or fill in. Simple bots fill
# every field they find; when it has a value we pretend to succeed but save nothing.
HONEYPOT_FIELD = "website"


class EnquiryCreateView(CreateAPIView):
    """POST /api/enquiries/ - submit a consultation request (create only)."""

    serializer_class = EnquiryCreateSerializer
    permission_classes = [CreateOnly]
    throttle_classes = [EnquiryBurstThrottle, EnquirySustainedThrottle]

    def create(self, request, *args, **kwargs):
        if not isinstance(request.data, dict):
            return Response({"ok": False, "error": "invalid_json"}, status=status.HTTP_400_BAD_REQUEST)

        if str(request.data.get(HONEYPOT_FIELD, "")).strip():
            logger.info("Enquiry discarded by honeypot check")
            return Response({"ok": True}, status=status.HTTP_201_CREATED)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            enquiry = serializer.save()
        except DatabaseError:
            # Log the failure type only - never the submitted details.
            logger.exception("Could not save enquiry: database unavailable")
            return Response(
                {"ok": False, "error": "service_unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        logger.info(
            "Enquiry saved id=%s service=%s language=%s",
            enquiry.pk,
            enquiry.service_type,
            enquiry.preferred_language,
        )
        return Response({"ok": True}, status=status.HTTP_201_CREATED)


@never_cache
@require_GET
def health_check(request):
    """Used by the host and by Jenkins after a deploy. Reveals no data."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        logger.exception("Health check: database unreachable")
        return JsonResponse({"status": "error", "database": "unreachable"}, status=503)
    # Render sets RENDER_GIT_COMMIT; Jenkins compares it to confirm the new
    # version is live. A short commit id reveals nothing sensitive.
    version = os.environ.get("RENDER_GIT_COMMIT", "")[:7] or "unknown"
    return JsonResponse({"status": "ok", "database": "ok", "version": version})
