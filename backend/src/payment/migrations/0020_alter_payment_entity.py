# Generated by Django 5.1.6 on 2025-02-18 08:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payment", "0019_alter_entity_email"),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="entity",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="payments",
                to="payment.entity",
            ),
        ),
    ]
