# syntax=docker/dockerfile:experimental
######################################
# Builder step #######################
######################################
FROM python:3.12.8-slim-bullseye AS builder

ARG BUILD_TARGET=live

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Use Python binaries from venv
ENV PATH="/backend/venv/bin:$PATH"

# Pinned versions
ENV PIP_PIP_VERSION 25.0.1
ENV PIP_SETUPTOOLS_VERSION 75.8.0
ENV APT_LIBMEMCACHED_DEV_VERSION 1.0.18-4.2
ENV APT_CMAKE_VERSION 3.18.4-2+deb11u1
ENV APT_GCC_VERSION 4:10.2.1-1
ENV APT_BUILD_ESSENTIAL 12.9*
ENV APT_DEFAULT_LIB_MYSQL_CLIENT_DEV 1.0.7*
ENV APT_PKG_CONFIG 0.29.2-*

# Install sys dependencies
RUN set -x && apt-get update && apt-get install -y --no-install-recommends \
    libmemcached-dev=$APT_LIBMEMCACHED_DEV_VERSION \
    cmake=$APT_CMAKE_VERSION \
    gcc=$APT_GCC_VERSION \
    build-essential=$APT_BUILD_ESSENTIAL \
    default-libmysqlclient-dev=$APT_DEFAULT_LIB_MYSQL_CLIENT_DEV \
    pkg-config=$APT_PKG_CONFIG \
    && apt-get clean \
    && rm -rf "/var/lib/apt/lists/*"

# Setup the virtualenv
RUN python -m venv /backend/venv
WORKDIR /backend

COPY src src

# Install dependencies
COPY "requirements/$BUILD_TARGET/requirements.txt" .
RUN set -x && \
    pip install pip==$PIP_PIP_VERSION setuptools==$PIP_PIP_VERSION && \
    pip install --pre --require-hashes -r "requirements.txt" && \
    pip check

######################################
# Runtime step #######################
######################################
FROM python:3.12.8-slim-bullseye AS runtime

# Extra Python environment variables
ENV XDG_CACHE_HOME /tmp/pip/.cache
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Use Python binaries from venv
ENV PATH="/backend/venv/bin:$PATH"

# Pinned versions
ENV APT_GETTEXT_VERSION 0.21-*
ENV APT_MAKE_VERSION 4.3-*
ENV APT_WAIT_FOR_IT_VERSION 0.0~git20180723-1
ENV APT_MIME_SUPPORT 3.*
ENV APT_LIB_MAGIC_DEV 1:5.39-*
ENV APT_WATCHMAN 4.9.0*
ENV APT_GDAL_VERSION 3.2.2*
ENV APT_LIB_MYSQL_CLIENT_DEV 8.0.41-*
ENV APT_BUILD_ESSENTIAL 12.9*
ENV APT_DEFAULT_LIB_MYSQL_CLIENT_DEV 1.0.7*
ENV APT_PKG_CONFIG 0.29.2-*

# Django settings
ENV DJANGO_SETTINGS_MODULE comunicat.settings
ENV DJANGO_STATIC_ROOT /backend/static

# Setup app user and directory
RUN set -x && groupadd -g 8000 backend && useradd -r -u 8000 -g backend backend -d /backend && \
    mkdir -p /backend/internal_media && chown -R backend:backend /backend

# Install system dependencies
# SC2215 is ignored due to https://github.com/hadolint/hadolint/issues/347
# hadolint ignore=SC2215
RUN set -x && apt-get update && apt-get install --no-install-recommends -y \
    gettext=$APT_GETTEXT_VERSION \
    make=$APT_MAKE_VERSION \
    wait-for-it=$APT_WAIT_FOR_IT_VERSION \
    mime-support=$APT_MIME_SUPPORT \
    libmagic-dev=$APT_LIB_MAGIC_DEV \
    watchman=$APT_WATCHMAN \
    gdal-bin=$APT_GDAL_VERSION \
    build-essential=$APT_BUILD_ESSENTIAL \
    default-libmysqlclient-dev=$APT_DEFAULT_LIB_MYSQL_CLIENT_DEV \
    pkg-config=$APT_PKG_CONFIG \
    && apt-get clean \
    && rm -rf "/var/lib/apt/lists/*"

RUN mkdir /data && chown -R backend:backend /data

# Install source code
COPY --from=builder /backend/venv /backend/venv

# Copy the src directory
COPY --from=builder --chown=backend:backend /backend/src /backend/src

WORKDIR /backend/src

# Collect static files
RUN set -x && \
    # DJANGO_SECRET_KEY=none python manage.py compilemessages --locale sv && \
    DJANGO_SECRET_KEY=none python manage.py collectstatic --no-input --clear

USER backend

# Set port
EXPOSE 8000
