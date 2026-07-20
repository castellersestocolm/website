import logging

import django

django.setup()

pytest_plugins = ["comunicat.utils.test.fixtures", "comunicat.utils.test.mocks"]

logging.getLogger("factory").setLevel(logging.WARNING)
