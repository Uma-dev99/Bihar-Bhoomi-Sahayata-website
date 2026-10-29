# Initial schema for enquiries. Django owns this schema: change models.py and
# run "python manage.py makemigrations", never edit tables in the Supabase UI.

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Enquiry",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100)),
                ("phone", models.CharField(help_text="Normalised, e.g. +919812345678", max_length=20)),
                (
                    "preferred_language",
                    models.CharField(choices=[('hi', 'Hindi'), ('en', 'English')], default="hi", max_length=2),
                ),
                (
                    "service_type",
                    models.CharField(choices=[('consultation', 'Initial consultation'), ('jamabandi', 'Jamabandi and land-record review'), ('mutation', 'Mutation paperwork guidance'), ('discrepancy', 'Document discrepancy report'), ('survey', 'Land-survey document preparation'), ('other', 'Other / not sure')], max_length=20),
                ),
                (
                    "district",
                    models.CharField(blank=True, choices=[('araria', 'Araria'), ('arwal', 'Arwal'), ('aurangabad', 'Aurangabad'), ('banka', 'Banka'), ('begusarai', 'Begusarai'), ('bhagalpur', 'Bhagalpur'), ('bhojpur', 'Bhojpur'), ('buxar', 'Buxar'), ('darbhanga', 'Darbhanga'), ('east_champaran', 'East Champaran'), ('gaya', 'Gaya'), ('gopalganj', 'Gopalganj'), ('jamui', 'Jamui'), ('jehanabad', 'Jehanabad'), ('kaimur', 'Kaimur'), ('katihar', 'Katihar'), ('khagaria', 'Khagaria'), ('kishanganj', 'Kishanganj'), ('lakhisarai', 'Lakhisarai'), ('madhepura', 'Madhepura'), ('madhubani', 'Madhubani'), ('munger', 'Munger'), ('muzaffarpur', 'Muzaffarpur'), ('nalanda', 'Nalanda'), ('nawada', 'Nawada'), ('patna', 'Patna'), ('purnia', 'Purnia'), ('rohtas', 'Rohtas'), ('saharsa', 'Saharsa'), ('samastipur', 'Samastipur'), ('saran', 'Saran'), ('sheikhpura', 'Sheikhpura'), ('sheohar', 'Sheohar'), ('sitamarhi', 'Sitamarhi'), ('siwan', 'Siwan'), ('supaul', 'Supaul'), ('vaishali', 'Vaishali'), ('west_champaran', 'West Champaran'), ('not_sure', 'Not sure / other')], default="", max_length=20),
                ),
                ("message", models.TextField(max_length=2000)),
                (
                    "status",
                    models.CharField(choices=[('new', 'New'), ('contacted', 'Contacted'), ('closed', 'Closed')], db_index=True, default="new", max_length=10),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={
                "verbose_name": "enquiry",
                "verbose_name_plural": "enquiries",
                "ordering": ["-created_at"],
                "constraints": [
                    models.CheckConstraint(
                        condition=models.Q(("preferred_language__in", ['hi', 'en'])),
                        name="enquiry_language_valid",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(("status__in", ['new', 'contacted', 'closed'])),
                        name="enquiry_status_valid",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(("service_type__in", ['consultation', 'jamabandi', 'mutation', 'discrepancy', 'survey', 'other'])),
                        name="enquiry_service_type_valid",
                    ),
                ],
            },
        ),
    ]
