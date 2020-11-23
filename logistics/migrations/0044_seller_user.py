# Generated by Django 3.1.1 on 2020-11-22 12:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('logistics', '0043_order_rider_payment_needed'),
    ]

    operations = [
        migrations.AddField(
            model_name='seller',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='seller', to=settings.AUTH_USER_MODEL),
        ),
    ]
