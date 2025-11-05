from django.urls import path
from .views import AddressListCreateView, AddressRetrieveUpdateView, check_address, AdminUpdateAddressAPIView

urlpatterns = [
    path("", AddressListCreateView.as_view(), name="address-list-create"),
    path("<int:pk>/", AddressRetrieveUpdateView.as_view(), name="address-retrieve-update"),
    path("check/", check_address, name="check-address"),
    path("<int:pk>/update-admin/", AdminUpdateAddressAPIView.as_view(), name="admin-update-address"),
]
