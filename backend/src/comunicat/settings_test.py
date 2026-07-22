from comunicat.settings import *  # noqa: F401,F403

SECRET_KEY = "2x9%{O91)OE>F#+ZzGbof8mht+flJ[[O"

MODULE_ORG_DOMAIN = "domain-org.org"
MODULE_TOWERS_DOMAIN = "domain-towers.org"

# Celery

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Email

EMAIL_PROVIDER = None

# Logging

LOGGING["loggers"]["celery.app.trace"] = {  # noqa: F405
    "handlers": ["console"],
    "level": "ERROR",
    "propagate": False,
}
