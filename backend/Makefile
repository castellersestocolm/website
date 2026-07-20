MAKEFILE := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR ?= $(patsubst %/,%,$(dir $(MAKEFILE)))
SRC_DIR = ${ROOT_DIR}/src

TEST_ENV = DJANGO_SETTINGS_MODULE=comunicat.settings_test PYTHONWARNINGS=once
PYTEST = pytest

.PHONY: wait-for-database
wait-for-postgres:
	@wait-for-it -t 15 database:5432 || true

.PHONY: requirements
requirements:
	python3 -m pip install pip pip-tools
	# python3 -m pip install --upgrade pip pip-tools
	pip-compile \
		--upgrade --generate-hashes --resolver=backtracking \
		--output-file requirements/live/requirements.txt \
		requirements/live/requirements.in
	pip-compile \
		--upgrade --generate-hashes --resolver=backtracking \
		--output-file requirements/dev/requirements.txt \
		requirements/live/requirements.in requirements/dev/requirements.in

.PHONY: test
test: wait-for-database
	cd $(SRC_DIR) && \
	$(TEST_ENV) $(PYTEST) $(test) --reuse-db -s --log-level=INFO

.PHONY: format
format:
	find $(SRC_DIR)/$(format) -name '*.py' -not -path '*/migrations/*' | xargs black
	isort -rc $(SRC_DIR)/$(format)
