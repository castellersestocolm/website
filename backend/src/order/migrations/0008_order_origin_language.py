# Generated by Django 5.1.8 on 2025-07-16 19:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("order", "0007_order_origin_module"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="origin_language",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
