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
    # Run every 5 minutes
    "event.import_events": {
        "task": "event.tasks.import_events",
        "schedule": crontab(minute="*/5"),
    },
    # Run every 2 hours
    "user.sync_users": {
        "task": "user.tasks.sync_users",
        "schedule": crontab(hour="*/2", minute="0"),
    },
}

if settings.MODULE_ORG_NOTIFY_EVENT_SIGNUP_TIME:
    app.conf.beat_schedule["event.send_events_signup_org"] = {
        "task": "event.tasks.send_events_signup_org",
        "schedule": crontab(**settings.MODULE_ORG_NOTIFY_EVENT_SIGNUP_TIME),
    }

if settings.MODULE_TOWERS_NOTIFY_EVENT_SIGNUP_TIME:
    app.conf.beat_schedule["event.send_events_signup_towers"] = {
        "task": "event.tasks.send_events_signup_towers",
        "schedule": crontab(**settings.MODULE_TOWERS_NOTIFY_EVENT_SIGNUP_TIME),
    }

app.conf.task_default_queue = "default"
