# Generated by Django 3.1.1 on 2020-11-08 13:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0039_auto_20201108_2118'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='seller',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='logistics.seller'),
        ),
    ]
