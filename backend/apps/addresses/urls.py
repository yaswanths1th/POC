# apps/addresses/urls.py
from django.urls import path
from .views import AddressListCreateView, AddressRetrieveUpdateView, check_address

urlpatterns = [
    path("", AddressListCreateView.as_view(), name="address-list-create"),  # GET all or POST new
    path("<int:pk>/", AddressRetrieveUpdateView.as_view(), name="address-retrieve-update"),  # GET/PUT specific
    path("check/", check_address, name="check-address"),  # To verify if address exists
]
