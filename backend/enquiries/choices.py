"""Fixed lists used by the Enquiry model, the API and (mirrored) the frontend.

If you change a value here, also update frontend/src/data/options.js and
create a migration with: python manage.py makemigrations
"""

from django.db import models


class Language(models.TextChoices):
    HINDI = "hi", "Hindi"
    ENGLISH = "en", "English"


class ServiceType(models.TextChoices):
    CONSULTATION = "consultation", "Initial consultation"
    JAMABANDI = "jamabandi", "Jamabandi and land-record review"
    MUTATION = "mutation", "Mutation paperwork guidance"
    DISCREPANCY = "discrepancy", "Document discrepancy report"
    SURVEY = "survey", "Land-survey document preparation"
    OTHER = "other", "Other / not sure"


class Status(models.TextChoices):
    NEW = "new", "New"
    CONTACTED = "contacted", "Contacted"
    CLOSED = "closed", "Closed"


class District(models.TextChoices):
    """The 38 districts of Bihar, plus an option for land elsewhere."""

    ARARIA = "araria", "Araria"
    ARWAL = "arwal", "Arwal"
    AURANGABAD = "aurangabad", "Aurangabad"
    BANKA = "banka", "Banka"
    BEGUSARAI = "begusarai", "Begusarai"
    BHAGALPUR = "bhagalpur", "Bhagalpur"
    BHOJPUR = "bhojpur", "Bhojpur"
    BUXAR = "buxar", "Buxar"
    DARBHANGA = "darbhanga", "Darbhanga"
    EAST_CHAMPARAN = "east_champaran", "East Champaran"
    GAYA = "gaya", "Gaya"
    GOPALGANJ = "gopalganj", "Gopalganj"
    JAMUI = "jamui", "Jamui"
    JEHANABAD = "jehanabad", "Jehanabad"
    KAIMUR = "kaimur", "Kaimur"
    KATIHAR = "katihar", "Katihar"
    KHAGARIA = "khagaria", "Khagaria"
    KISHANGANJ = "kishanganj", "Kishanganj"
    LAKHISARAI = "lakhisarai", "Lakhisarai"
    MADHEPURA = "madhepura", "Madhepura"
    MADHUBANI = "madhubani", "Madhubani"
    MUNGER = "munger", "Munger"
    MUZAFFARPUR = "muzaffarpur", "Muzaffarpur"
    NALANDA = "nalanda", "Nalanda"
    NAWADA = "nawada", "Nawada"
    PATNA = "patna", "Patna"
    PURNIA = "purnia", "Purnia"
    ROHTAS = "rohtas", "Rohtas"
    SAHARSA = "saharsa", "Saharsa"
    SAMASTIPUR = "samastipur", "Samastipur"
    SARAN = "saran", "Saran"
    SHEIKHPURA = "sheikhpura", "Sheikhpura"
    SHEOHAR = "sheohar", "Sheohar"
    SITAMARHI = "sitamarhi", "Sitamarhi"
    SIWAN = "siwan", "Siwan"
    SUPAUL = "supaul", "Supaul"
    VAISHALI = "vaishali", "Vaishali"
    WEST_CHAMPARAN = "west_champaran", "West Champaran"
    NOT_SURE = "not_sure", "Not sure / other"
