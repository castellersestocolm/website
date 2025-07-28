import threading
from abc import ABC
from logging import getLogger
from typing import Union

from django.conf import settings
from slack_sdk import WebClient
from slack_sdk.web import SlackResponse

from comunicat.enums import Module

thread_local = threading.local()

_log = getLogger(__name__)


class SlackClient(ABC):
    pass


class SlackDummyClient(SlackClient):
    def chat_post_message(self, *args, **kwargs):
        _log.debug(f"Dummy chat post message for Slack")
        return {
            "ok": True,
            "message": {},
        }


class SlackAPIClient(SlackClient):
    slack: WebClient

    def __init__(self, module: Module):
        self._authenticate(module=module)

    def _authenticate(self, module: Module):
        self.slack = WebClient(
            token=getattr(settings, f"SLACK_{Module(module).name}_BOT_TOKEN")
        )

    def chat_post_message(self, channel: str, blocks: list[dict]) -> SlackResponse:
        return self.slack.chat_postMessage(channel=channel, blocks=blocks)


def get_client(module: Module) -> Union[SlackDummyClient, SlackAPIClient]:
    module_name = Module(module).name
    if getattr(settings, f"SLACK_{module_name}_ENABLED") and getattr(
        settings, f"SLACK_{module_name}_BOT_TOKEN"
    ):
        return SlackAPIClient(module=module)
    return SlackDummyClient()
