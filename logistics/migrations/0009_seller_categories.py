# Generated by Django 3.1.1 on 2020-09-15 04:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0008_auto_20200915_1228'),
    ]

    operations = [
        migrations.AddField(
            model_name='seller',
            name='categories',
            field=models.ManyToManyField(to='logistics.Category'),
        ),
    ]
