# Generated by Django 3.1.1 on 2020-12-11 10:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0054_auto_20201203_0617'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='checkout_validity',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]