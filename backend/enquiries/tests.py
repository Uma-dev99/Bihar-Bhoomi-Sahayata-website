"""Backend tests. Run with:  pytest  (from the backend folder)."""

from datetime import timedelta
from io import StringIO

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import DatabaseError
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from enquiries.models import Enquiry
from enquiries.serializers import normalise_phone

URL = "/api/enquiries/"

VALID = {
    "name": "Example Customer",
    "phone": "9000000000",
    "preferred_language": "hi",
    "service_type": "jamabandi",
    "district": "gaya",
    "message": "I need guidance about a land-record entry.",
    "privacy_accepted": True,
}


@pytest.fixture
def client():
    return APIClient()


def post(client, **overrides):
    payload = {**VALID, **overrides}
    payload = {k: v for k, v in payload.items() if v is not ...}
    return client.post(URL, payload, format="json")


def field_codes(response, field):
    return [e["code"] for e in response.json()["fields"][field]]


# --- successful creation -------------------------------------------------


@pytest.mark.django_db
def test_valid_enquiry_is_saved(client):
    response = post(client)
    assert response.status_code == 201
    assert response.json() == {"ok": True}
    enquiry = Enquiry.objects.get()
    assert enquiry.name == "Example Customer"
    assert enquiry.phone == "+919000000000"
    assert enquiry.status == "new"
    assert enquiry.district == "gaya"


@pytest.mark.django_db
def test_response_does_not_echo_personal_data(client):
    body = post(client).content.decode()
    assert "9000000000" not in body
    assert "Example Customer" not in body


@pytest.mark.django_db
def test_created_at_is_set_automatically(client):
    before = timezone.now()
    post(client, created_at="2001-01-01T00:00:00Z", status="closed")
    enquiry = Enquiry.objects.get()
    assert before <= enquiry.created_at <= timezone.now()
    # Visitors cannot choose the status either.
    assert enquiry.status == "new"


@pytest.mark.django_db
def test_district_is_optional(client):
    assert post(client, district=...).status_code == 201
    assert post(client, district="", phone="9111111111").status_code == 201
    assert set(Enquiry.objects.values_list("district", flat=True)) == {""}


@pytest.mark.django_db
def test_whitespace_is_trimmed(client):
    post(client, name="   Ram   Kumar  ", message="  Need help with mutation papers.  \n\n\n\n Thanks ")
    enquiry = Enquiry.objects.get()
    assert enquiry.name == "Ram Kumar"
    assert enquiry.message == "Need help with mutation papers.\n\nThanks"


@pytest.mark.django_db
def test_hindi_text_is_accepted(client):
    response = post(client, name="राम कुमार", message="मुझे जमाबंदी में नाम सुधार के बारे में जानकारी चाहिए।")
    assert response.status_code == 201
    assert Enquiry.objects.get().name == "राम कुमार"


# --- validation ----------------------------------------------------------


@pytest.mark.django_db
@pytest.mark.parametrize("field", ["name", "phone", "preferred_language", "service_type", "message"])
def test_missing_required_field(client, field):
    response = post(client, **{field: ...})
    assert response.status_code == 400
    body = response.json()
    assert body["ok"] is False
    assert body["error"] == "validation_error"
    assert "required" in field_codes(response, field)
    assert Enquiry.objects.count() == 0


@pytest.mark.django_db
def test_privacy_notice_must_be_accepted(client):
    assert post(client, privacy_accepted=False).status_code == 400
    assert post(client, privacy_accepted=...).status_code == 400
    assert Enquiry.objects.count() == 0


@pytest.mark.django_db
def test_invalid_language(client):
    response = post(client, preferred_language="fr")
    assert response.status_code == 400
    assert field_codes(response, "preferred_language") == ["invalid_choice"]


@pytest.mark.django_db
def test_invalid_service_type(client):
    response = post(client, service_type="legal_opinion")
    assert response.status_code == 400
    assert field_codes(response, "service_type") == ["invalid_choice"]


@pytest.mark.django_db
def test_invalid_district(client):
    assert post(client, district="atlantis").status_code == 400


@pytest.mark.django_db
@pytest.mark.parametrize("field", ["name", "message"])
@pytest.mark.parametrize("value", ["", "    ", "\n\t  \n"])
def test_empty_or_whitespace_only_values_rejected(client, field, value):
    response = post(client, **{field: value})
    assert response.status_code == 400
    assert field_codes(response, field) == ["blank"]


@pytest.mark.django_db
def test_overlong_name(client):
    response = post(client, name="a" * 101)
    assert response.status_code == 400
    assert field_codes(response, "name") == ["max_length"]


@pytest.mark.django_db
def test_name_at_limit_is_accepted(client):
    assert post(client, name="a" * 100).status_code == 201


@pytest.mark.django_db
def test_overlong_message(client):
    response = post(client, message="x" * 2001)
    assert response.status_code == 400
    assert field_codes(response, "message") == ["max_length"]


@pytest.mark.django_db
def test_message_at_limit_is_accepted(client):
    assert post(client, message="x" * 2000).status_code == 201


@pytest.mark.django_db
def test_too_short_message(client):
    response = post(client, message="help")
    assert field_codes(response, "message") == ["min_length"]


@pytest.mark.django_db
@pytest.mark.parametrize("phone", ["12345", "abcdefghij", "5123456789", "+91 12345 67890", "9" * 40])
def test_invalid_phone(client, phone):
    response = post(client, phone=phone)
    assert response.status_code == 400
    assert field_codes(response, "phone") == ["invalid"]


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("9812345678", "+919812345678"),
        ("09812345678", "+919812345678"),
        ("+91 98123 45678", "+919812345678"),
        ("91-98123-45678", "+919812345678"),
        ("0091 9812345678", "+919812345678"),
        ("+44 7700 900123", "+447700900123"),
        ("12345", None),
        ("", None),
    ],
)
def test_normalise_phone(raw, expected):
    assert normalise_phone(raw) == expected


@pytest.mark.django_db
def test_invalid_json_body(client):
    response = client.post(URL, "{not json", content_type="application/json")
    assert response.status_code == 400
    assert response.json()["error"] == "invalid_json"


@pytest.mark.django_db
def test_list_payload_rejected(client):
    response = client.post(URL, [VALID], format="json")
    assert response.status_code == 400


# --- access control ------------------------------------------------------


@pytest.mark.django_db
def test_public_cannot_list_enquiries(client):
    post(client)
    response = client.get(URL)
    assert response.status_code in (403, 405)
    assert "Example Customer" not in response.content.decode()


@pytest.mark.django_db
@pytest.mark.parametrize("method", ["put", "patch", "delete"])
def test_public_cannot_modify_enquiries(client, method):
    post(client)
    response = getattr(client, method)(URL, {"status": "closed"}, format="json")
    assert response.status_code in (403, 405)
    assert Enquiry.objects.get().status == "new"


@pytest.mark.django_db
def test_public_cannot_retrieve_single_enquiry(client):
    post(client)
    enquiry = Enquiry.objects.get()
    response = client.get(f"{URL}{enquiry.pk}/")
    assert response.status_code == 404
    assert "Example Customer" not in response.content.decode()


@pytest.mark.django_db
def test_admin_requires_login(client, settings):
    response = client.get(f"/{settings.ADMIN_URL_PATH}enquiries/enquiry/")
    assert response.status_code == 302
    assert "login" in response["Location"]


@pytest.mark.django_db
def test_superuser_can_view_enquiries_in_admin(settings):
    post(APIClient())
    user = get_user_model().objects.create_superuser("owner", password="a-long-test-password-123")
    admin_client = APIClient()
    admin_client.force_login(user)
    response = admin_client.get(f"/{settings.ADMIN_URL_PATH}enquiries/enquiry/")
    assert response.status_code == 200
    assert "Example Customer" in response.content.decode()


# --- abuse protection ----------------------------------------------------


@pytest.mark.django_db
def test_honeypot_submission_is_not_saved(client):
    response = post(client, website="http://spam.example")
    assert response.status_code == 201  # looks successful to the bot
    assert Enquiry.objects.count() == 0


@pytest.mark.django_db
def test_rate_limit(client, settings):
    for i in range(3):
        assert post(client, phone=f"900000000{i}").status_code == 201
    response = post(client, phone="9000000009")
    assert response.status_code == 429
    assert response.json()["error"] == "rate_limited"
    assert Enquiry.objects.count() == 3


@pytest.mark.django_db
def test_database_failure_returns_503(client, monkeypatch):
    def broken_save(*args, **kwargs):
        raise DatabaseError("connection lost")

    monkeypatch.setattr(Enquiry, "save", broken_save)
    response = post(client)
    assert response.status_code == 503
    assert response.json() == {"ok": False, "error": "service_unavailable"}


@pytest.mark.django_db
def test_personal_data_is_not_logged(client, caplog):
    caplog.set_level("DEBUG")
    post(client)
    post(client, name="")  # a validation failure
    assert "9000000000" not in caplog.text
    assert "Example Customer" not in caplog.text
    assert "land-record entry" not in caplog.text


# --- health check and retention ------------------------------------------


@pytest.mark.django_db
def test_health_check(client):
    response = client.get(reverse("health"))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert set(body) == {"status", "database", "version"}


@pytest.mark.django_db
def test_purge_only_deletes_old_closed_enquiries():
    old = timezone.now() - timedelta(days=400)
    keep_open = Enquiry.objects.create(name="A", phone="+919000000001", service_type="other", message="x" * 10)
    old_closed = Enquiry.objects.create(
        name="B", phone="+919000000002", service_type="other", message="x" * 10, status="closed"
    )
    recent_closed = Enquiry.objects.create(
        name="C", phone="+919000000003", service_type="other", message="x" * 10, status="closed"
    )
    Enquiry.objects.filter(pk__in=[keep_open.pk, old_closed.pk]).update(created_at=old)

    out = StringIO()
    call_command("purge_old_enquiries", stdout=out)  # dry run
    assert "1 closed" in out.getvalue()
    assert Enquiry.objects.count() == 3

    call_command("purge_old_enquiries", "--confirm", stdout=StringIO())
    assert set(Enquiry.objects.values_list("pk", flat=True)) == {keep_open.pk, recent_closed.pk}
