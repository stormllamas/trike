# Generated by Django 3.1.1 on 2020-12-02 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0051_auto_20201201_1602'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='ordered_shipping_commission',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
