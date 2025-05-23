# Generated by Django 5.1.6 on 2025-02-20 11:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("event", "0005_alter_googlecalendar_external_id_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="location",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="events",
                to="event.location",
            ),
        ),
    ]
