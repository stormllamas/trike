# Generated by Django 3.1.1 on 2020-09-11 22:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuration', '0004_auto_20200910_1401'),
    ]

    operations = [
        migrations.AlterField(
            model_name='siteconfiguration',
            name='email',
            field=models.EmailField(blank=True, default='', max_length=55, null=True),
        ),
        migrations.AlterField(
            model_name='siteconfiguration',
            name='location',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='siteconfiguration',
            name='phone',
            field=models.CharField(blank=True, default='', max_length=55, null=True),
        ),
    ]
