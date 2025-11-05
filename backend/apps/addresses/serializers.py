from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["id", "created_at"]  # user will be set in view

    def create(self, validated_data):
        request = self.context.get("request")
        # Use 'user' from validated_data first (for admin), fallback to request.user
        user = validated_data.get("user") or (request.user if request else None)
        validated_data["user"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent changing the user
        validated_data.pop("user", None)
        return super().update(instance, validated_data)
