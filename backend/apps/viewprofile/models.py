from django.db import models

class UserProfile(models.Model):
    # optional: extend fields as needed
    name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    house = models.CharField(max_length=200, blank=True)
    street = models.CharField(max_length=200, blank=True)
    landmark = models.CharField(max_length=200, blank=True)
    area = models.CharField(max_length=200, blank=True)
    district = models.CharField(max_length=200, blank=True)
    state = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or f"Profile {self.pk}"
