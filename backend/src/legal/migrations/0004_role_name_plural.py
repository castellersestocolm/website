# Generated by Django 5.1.7 on 2025-03-25 19:20

import comunicat.utils.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("legal", "0003_alter_bylaws_options_remove_bylaws_body_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="role",
            name="name_plural",
            field=models.JSONField(
                default=comunicat.utils.models.language_field_default
            ),
        ),
    ]
