# Generated by Django 5.1.5 on 2025-01-31 13:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notify", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="email",
            name="module",
            field=models.PositiveSmallIntegerField(
                choices=[(10, "TOWERS"), (20, "ORG")], default=10
            ),
            preserve_default=False,
        ),
    ]
