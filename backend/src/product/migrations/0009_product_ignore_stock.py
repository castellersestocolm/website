# Generated by Django 5.1.8 on 2025-07-16 16:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("product", "0008_alter_productsize_options_product_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="ignore_stock",
            field=models.BooleanField(default=False),
        ),
    ]
