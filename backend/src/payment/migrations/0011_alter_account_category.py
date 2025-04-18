# Generated by Django 5.1.6 on 2025-02-16 15:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payment", "0010_account_category"),
    ]

    operations = [
        migrations.AlterField(
            model_name="account",
            name="category",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (10, "ASSETS"),
                    (20, "SAVINGS"),
                    (30, "GRANTS"),
                    (40, "DONATIONS"),
                    (50, "DEBTS"),
                    (60, "MEMBERSHIPS"),
                    (70, "EVENTS"),
                    (80, "PURCHASES"),
                    (90, "RENT"),
                    (100, "SALARIES"),
                    (110, "TAX"),
                    (120, "INSURANCE"),
                ]
            ),
        ),
    ]
