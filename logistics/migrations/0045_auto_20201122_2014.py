# Generated by Django 3.1.1 on 2020-11-22 12:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0044_seller_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='date_prepared',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='is_prepared',
            field=models.BooleanField(default=False),
        ),
    ]
