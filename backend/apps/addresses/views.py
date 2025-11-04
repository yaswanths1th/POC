from rest_framework import generics, permissions
from .models import Address
from .serializers import AddressSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def check_address(request):
    has_address = Address.objects.filter(user=request.user).exists()
    return Response({"has_address": has_address})
