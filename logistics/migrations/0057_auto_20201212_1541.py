# Generated by Django 3.1.1 on 2020-12-12 07:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0056_auto_20201212_1536'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]