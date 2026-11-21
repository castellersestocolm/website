import pytest
from django.test import TestCase
from djmoney.money import Money

from comunicat.template_tags.comunicat_tags import (
    format_money,
    format_money_2f,
    format_phone,
    format_text,
)


@pytest.mark.django_db
class TestFormatting(TestCase):
    def test_format_money(self, *args, **kwargs):
        money_1 = format_money(amount=Money("100.20", "SEK"))
        self.assertEqual(money_1, "100 SEK")

    def test_format_money_2f(self, *args, **kwargs):
        money_1 = format_money_2f(amount=Money("100.20", "SEK"))
        self.assertEqual(money_1, "100,20 SEK")

    def test_format_text(self, *args, **kwargs):
        html = format_text(
            text="Hello there!\nNew line with **text in bold** and *in italics*."
        )
        self.assertEqual(
            html,
            "<p>Hello there!</p><p>New line with <strong>text in bold</strong> and <em>in italics</em>.</p>",
        )

    def test_format_phone(self, *args, **kwargs):
        phone_1 = format_phone(phone=None)
        self.assertEqual(phone_1, "")

        phone_2 = format_phone(phone="+46701234567")
        self.assertEqual(phone_2, "070-123 45 67")

        phone_3 = format_phone(phone="+34601234567")
        self.assertEqual(phone_3, "+34 601 23 45 67")
