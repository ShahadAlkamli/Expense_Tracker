from django.db import models

class Transaction(models.Model):
    # Define model fields here
    text = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
