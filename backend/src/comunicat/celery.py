import os

from celery import Celery
from celery.schedules import crontab

from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "comunicat.settings")

app = Celery("comunicat")
app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()

app.conf.timezone = settings.TIME_ZONE

app.conf.beat_schedule = {
    # Run every day
    "event.import_events": {
        "task": "event.tasks.import_events",
        "schedule": crontab(minute="*/5"),
    },
}

app.conf.task_default_queue = "default"
