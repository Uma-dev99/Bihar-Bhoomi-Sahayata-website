"""Permissions for the public API.

The public enquiry endpoint is create-only. Anonymous visitors may POST a new
enquiry and nothing else: no listing, reading, editing or deleting. Reviewing
enquiries happens only in the password-protected Django admin.
"""

from rest_framework.permissions import BasePermission


class CreateOnly(BasePermission):
    message = "Only new enquiries can be submitted here."

    def has_permission(self, request, view):
        return request.method in ("POST", "OPTIONS")
