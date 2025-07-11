# Generated by Django 5.1.8 on 2025-07-05 11:34

import comunicat.utils.models
import django.db.models.deletion
import djmoney.models.fields
import uuid
import versatileimagefield.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("payment", "0031_receipt_entity_part_2"),
    ]

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated"),
                ),
                (
                    "name",
                    models.JSONField(
                        default=comunicat.utils.models.language_field_default
                    ),
                ),
                (
                    "type",
                    models.PositiveSmallIntegerField(
                        choices=[
                            (3210, "SHIRT"),
                            (3220, "FAIXA"),
                            (3230, "BANDANA"),
                            (3240, "TSHIRT"),
                        ]
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="ArticleImage",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated"),
                ),
                (
                    "picture",
                    versatileimagefield.fields.VersatileImageField(
                        upload_to="product/article/picture/", verbose_name="Image"
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="product.product",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="ProductSize",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated"),
                ),
                (
                    "category",
                    models.PositiveSmallIntegerField(
                        blank=True,
                        choices=[(10, "CHILDREN"), (20, "ADULTS")],
                        null=True,
                    ),
                ),
                ("size", models.CharField(max_length=32)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sizes",
                        to="product.product",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="ProductPrice",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated"),
                ),
                (
                    "module",
                    models.PositiveSmallIntegerField(
                        blank=True, choices=[(10, "ORG"), (20, "TOWERS")], null=True
                    ),
                ),
                (
                    "amount_currency",
                    djmoney.models.fields.CurrencyField(
                        choices=[("SEK", "Swedish Krona")],
                        default="SEK",
                        editable=False,
                        max_length=3,
                    ),
                ),
                (
                    "amount",
                    djmoney.models.fields.MoneyField(
                        decimal_places=2, default_currency="SEK", max_digits=7
                    ),
                ),
                ("vat", models.PositiveSmallIntegerField(default=0)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="prices",
                        to="product.product",
                    ),
                ),
                (
                    "size",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="prices",
                        to="product.productsize",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="StockOrder",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated"),
                ),
                ("date_made", models.DateField(blank=True, null=True)),
                ("date_available", models.DateField(blank=True, null=True)),
                (
                    "receipt",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="stock_orders",
                        to="payment.receipt",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="StockArticle",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="created"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="updated"),
                ),
                ("amount", models.PositiveSmallIntegerField()),
                (
                    "size",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="stocks",
                        to="product.productsize",
                    ),
                ),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="articles",
                        to="product.stockorder",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
