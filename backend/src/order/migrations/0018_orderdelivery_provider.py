# Generated by Django 5.1.8 on 2025-07-19 17:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("order", "0017_orderdelivery_event"),
    ]

    operations = [
        migrations.AddField(
            model_name="orderdelivery",
            name="provider",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="deliveries",
                to="order.deliveryprovider",
            ),
        ),
    ]
