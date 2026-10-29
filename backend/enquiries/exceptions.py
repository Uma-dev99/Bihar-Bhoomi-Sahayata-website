"""Turn every API error into the same JSON shape.

    {"ok": false, "error": "<code>", "fields": {...}}

The frontend reads the machine-readable codes and shows its own Hindi or
English message, so error text never has to be translated on the server.
"""

from rest_framework import exceptions
from rest_framework.views import exception_handler


def json_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        # Unexpected server errors fall through to Django's 500 handling.
        return None

    if isinstance(exc, exceptions.ValidationError):
        details = exc.get_full_details()
        if not isinstance(details, dict):
            details = {"non_field_errors": details}
        response.data = {"ok": False, "error": "validation_error", "fields": details}
    elif isinstance(exc, exceptions.Throttled):
        response.data = {"ok": False, "error": "rate_limited", "retry_after": exc.wait and int(exc.wait)}
    elif isinstance(exc, exceptions.ParseError):
        response.data = {"ok": False, "error": "invalid_json"}
    elif isinstance(exc, exceptions.UnsupportedMediaType):
        response.data = {"ok": False, "error": "unsupported_media_type"}
    elif isinstance(exc, exceptions.MethodNotAllowed):
        response.data = {"ok": False, "error": "method_not_allowed"}
    elif isinstance(exc, (exceptions.PermissionDenied, exceptions.NotAuthenticated)):
        response.data = {"ok": False, "error": "forbidden"}
    elif isinstance(exc, exceptions.NotFound):
        response.data = {"ok": False, "error": "not_found"}
    else:
        response.data = {"ok": False, "error": "error"}
    return response
