# Generated by Django 3.1.1 on 2021-03-17 12:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logistics', '0069_auto_20210317_2039'),
        ('accounts', '0019_auto_20210317_1740'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='promo_codes_used',
            field=models.ManyToManyField(blank=True, to='logistics.PromoCode'),
        ),
    ]
