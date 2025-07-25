# Generated by Django 5.1.11 on 2025-07-26 16:17

import payment.enums
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payment", "0037_alter_paymentorder_external_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="method",
            field=models.PositiveIntegerField(
                blank=True,
                choices=[
                    (10, "CASH"),
                    (20, "TRANSFER"),
                    (30, "CARD"),
                    (110, "PAYPAL"),
                    (75201, "SE_SWISH"),
                    (75202, "SE_PLUSGIRO"),
                ],
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="paymentprovider",
            name="method",
            field=models.PositiveIntegerField(
                choices=[
                    (10, "CASH"),
                    (20, "TRANSFER"),
                    (30, "CARD"),
                    (110, "PAYPAL"),
                    (75201, "SE_SWISH"),
                    (75202, "SE_PLUSGIRO"),
                ]
            ),
        ),
        migrations.AlterField(
            model_name="transaction",
            name="method",
            field=models.PositiveIntegerField(
                choices=[
                    (10, "CASH"),
                    (20, "TRANSFER"),
                    (30, "CARD"),
                    (110, "PAYPAL"),
                    (75201, "SE_SWISH"),
                    (75202, "SE_PLUSGIRO"),
                ],
                default=payment.enums.PaymentMethod["TRANSFER"],
            ),
        ),
    ]
