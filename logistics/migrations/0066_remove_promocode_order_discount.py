# Generated by Django 3.1.1 on 2021-02-22 04:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0065_auto_20210222_0704'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='promocode',
            name='order_discount',
        ),
    ]