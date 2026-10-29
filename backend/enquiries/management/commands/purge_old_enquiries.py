"""Delete CLOSED enquiries older than the retention period.

Dry run (shows the count, deletes nothing):
    python manage.py purge_old_enquiries
Actually delete:
    python manage.py purge_old_enquiries --confirm
Custom period:
    python manage.py purge_old_enquiries --days 180 --confirm

Enquiries that are still "new" or "contacted" are never deleted by this
command. Nothing runs automatically: the owner decides when to run it
(see docs/OPERATIONS.md for the policy).
"""

from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from enquiries.choices import Status
from enquiries.models import Enquiry


class Command(BaseCommand):
    help = "Delete closed enquiries older than the retention period (dry run unless --confirm)."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=settings.ENQUIRY_RETENTION_DAYS)
        parser.add_argument("--confirm", action="store_true", help="Actually delete the records.")

    def handle(self, *args, days, confirm, **options):
        if days < 30:
            raise CommandError("Refusing to use a retention period shorter than 30 days.")
        cutoff = timezone.now() - timedelta(days=days)
        old = Enquiry.objects.filter(status=Status.CLOSED, created_at__lt=cutoff)
        count = old.count()
        if not confirm:
            self.stdout.write(f"Dry run: {count} closed enquiries older than {days} days would be deleted.")
            self.stdout.write("Run again with --confirm to delete them.")
            return
        deleted, _ = old.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} closed enquiries older than {days} days."))
