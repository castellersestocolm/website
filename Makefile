MAKEFILE := $(abspath $(lastword $(MAKEFILE_LIST)))
ROOT_DIR ?= $(patsubst %/,%,$(dir $(MAKEFILE)))
BACKEND_DIR = ${ROOT_DIR}/backend

.PHONY: backend-requirements
backend-requirements:
	python3 -m pip install pip pip-tools
	# python3 -m pip install --upgrade pip pip-tools
	pip-compile \
		--upgrade --generate-hashes --resolver=backtracking \
		--output-file $(BACKEND_DIR)/requirements/live/requirements.txt \
		$(BACKEND_DIR)/requirements/live/requirements.in
	pip-compile \
		--upgrade --generate-hashes --resolver=backtracking \
		--output-file $(BACKEND_DIR)/requirements/dev/requirements.txt \
		$(BACKEND_DIR)/requirements/live/requirements.in $(BACKEND_DIR)/requirements/dev/requirements.in
