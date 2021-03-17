# Generated by Django 3.1.1 on 2021-03-17 12:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0068_seller_is_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='promocode',
            name='affiliate_commission',
            field=models.DecimalField(decimal_places=2, default=0.1, max_digits=30),
        ),
        migrations.AddField(
            model_name='promocode',
            name='rider_commission',
            field=models.DecimalField(decimal_places=2, default=0.1, max_digits=30),
        ),
        migrations.AlterField(
            model_name='promocode',
            name='delivery_discount',
            field=models.DecimalField(decimal_places=2, default=0.1, max_digits=30),
        ),
    ]
