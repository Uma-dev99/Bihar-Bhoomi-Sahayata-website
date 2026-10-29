import re

from rest_framework import serializers

from .choices import District, Language, ServiceType
from .models import Enquiry

NAME_MIN = 2
NAME_MAX = 100
MESSAGE_MIN = 10
MESSAGE_MAX = 2000

_SEPARATORS = re.compile(r"[\s\-().]")
_INDIAN_MOBILE = re.compile(r"^[6-9]\d{9}$")
_INTERNATIONAL = re.compile(r"^\+[1-9]\d{7,14}$")
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def normalise_phone(raw: str) -> str | None:
    """Return a normalised phone number, or None if it is not valid.

    Accepted:
      * Indian mobiles: 9812345678, 09812345678, +91 98123 45678, 91-9812345678
        -> stored as +919812345678
      * Other countries in international format: +44 7700 900123 (8-15 digits)
        -> stored as +447700900123, for landowners living abroad.
    """
    value = _SEPARATORS.sub("", raw or "")
    if value.startswith("00"):
        value = "+" + value[2:]
    if value.startswith("+91"):
        local = value[3:]
    elif value.startswith("91") and len(value) == 12:
        local = value[2:]
    elif value.startswith("0") and len(value) == 11:
        local = value[1:]
    elif value.startswith("+"):
        return value if _INTERNATIONAL.match(value) else None
    else:
        local = value
    return f"+91{local}" if _INDIAN_MOBILE.match(local) else None


def clean_text(value: str, *, single_line: bool) -> str:
    value = _CONTROL_CHARS.sub("", value or "")
    if single_line:
        return " ".join(value.split())
    # Keep line breaks in messages but trim each line and drop excess blank lines.
    lines = [" ".join(line.split()) for line in value.replace("\r\n", "\n").split("\n")]
    text = "\n".join(lines).strip()
    return re.sub(r"\n{3,}", "\n\n", text)


class EnquiryCreateSerializer(serializers.ModelSerializer):
    """Write-only serializer for the public enquiry form."""

    name = serializers.CharField(
        trim_whitespace=False,
        error_messages={"required": "Name is required.", "blank": "Name is required."},
    )
    phone = serializers.CharField(
        trim_whitespace=False,
        error_messages={"required": "Phone number is required.", "blank": "Phone number is required."},
    )
    preferred_language = serializers.ChoiceField(
        choices=Language.choices,
        error_messages={"invalid_choice": "Choose Hindi (hi) or English (en)."},
    )
    service_type = serializers.ChoiceField(
        choices=ServiceType.choices,
        error_messages={"invalid_choice": "Choose a service from the list."},
    )
    district = serializers.ChoiceField(
        choices=District.choices,
        required=False,
        allow_blank=True,
        error_messages={"invalid_choice": "Choose a district from the list."},
    )
    message = serializers.CharField(
        trim_whitespace=False,
        error_messages={"required": "Message is required.", "blank": "Message is required."},
    )
    # Must be ticked on the form. It is checked here and not stored.
    privacy_accepted = serializers.BooleanField(write_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "name",
            "phone",
            "preferred_language",
            "service_type",
            "district",
            "message",
            "privacy_accepted",
        ]

    def validate_name(self, value):
        value = clean_text(value, single_line=True)
        if not value:
            raise serializers.ValidationError("Name is required.", code="blank")
        if len(value) < NAME_MIN:
            raise serializers.ValidationError("Name is too short.", code="min_length")
        if len(value) > NAME_MAX:
            raise serializers.ValidationError(f"Name must be at most {NAME_MAX} characters.", code="max_length")
        if not any(ch.isalpha() for ch in value):
            raise serializers.ValidationError("Enter a real name.", code="invalid")
        return value

    def validate_phone(self, value):
        if len(value or "") > 30:
            raise serializers.ValidationError("Enter a valid phone number.", code="invalid")
        phone = normalise_phone(value)
        if phone is None:
            raise serializers.ValidationError("Enter a valid phone number.", code="invalid")
        return phone

    def validate_message(self, value):
        value = clean_text(value, single_line=False)
        if not value:
            raise serializers.ValidationError("Message is required.", code="blank")
        if len(value) < MESSAGE_MIN:
            raise serializers.ValidationError("Please describe your question in a little more detail.", code="min_length")
        if len(value) > MESSAGE_MAX:
            raise serializers.ValidationError(
                f"Message must be at most {MESSAGE_MAX} characters.", code="max_length"
            )
        return value

    def validate_privacy_accepted(self, value):
        if value is not True:
            raise serializers.ValidationError("Please accept the privacy notice.", code="required")
        return value

    def create(self, validated_data):
        validated_data.pop("privacy_accepted", None)
        return super().create(validated_data)
