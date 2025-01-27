from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def _get_full_details(detail):
    if isinstance(detail, list):
        return [_get_full_details(item) for item in detail]
    elif isinstance(detail, dict):
        return {key: _get_full_details(value) for key, value in detail.items()}
    return {"detail": detail, "code": detail.code}


def full_details_exception_handler(exc, context):
    if isinstance(exc, APIException):
        exc.detail = _get_full_details(exc.detail)

    return exception_handler(exc, context)
