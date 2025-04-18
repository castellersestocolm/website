# Generated by Django 5.1.6 on 2025-02-16 19:40

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payment", "0017_transactionimport_source"),
    ]

    operations = [
        migrations.AddField(
            model_name="transactionimport",
            name="file",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to="payment/transactionimport/file/",
                validators=[django.core.validators.FileExtensionValidator(["csv"])],
            ),
        ),
        migrations.AlterField(
            model_name="transactionimport",
            name="input",
            field=models.TextField(blank=True, max_length=10000, null=True),
        ),
    ]
