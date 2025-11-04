from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
from datetime import timedelta

from .models import OTPCode
from .serializers import SendOtpSerializer, VerifyOtpSerializer
from apps.accounts.models import User  # Import User from your accounts app


def generate_otp():
    """Generate a random 6-digit OTP"""
    return f"{random.randint(0, 999999):06d}"


@api_view(['POST'])
def send_otp_view(request):
    """
    Endpoint: POST /api/password-reset/send-otp/
    Input: { "email": "user@example.com" }
    """
    serializer = SendOtpSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"detail": "Invalid input"}, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower()

    # ✅ Step 1: Check if user exists before generating OTP
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            "detail": "Email not found — please register first.",
            "sent": False
        }, status=status.HTTP_404_NOT_FOUND)

    # ✅ Step 2: Generate OTP and expiry
    otp = generate_otp()
    expiry = timezone.now() + timedelta(minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 5))

    # ✅ Step 3: Save OTP
    OTPCode.objects.create(email=email, otp_code=otp, expiry_time=expiry)

    # ✅ Step 4: Send email
    subject = "Your OTP for Password Reset"
    message = f"Your OTP is: {otp}\nIt expires at {expiry.strftime('%H:%M:%S')} UTC.\nIf you didn’t request this, ignore."
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    recipient_list = [email]

    try:
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    except Exception as e:
        print("⚠️ Warning: send_mail failed:", e)
        return Response({"detail": "Failed to send OTP email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ✅ Step 5: Return success
    return Response({"detail": "Verifiaction code sent successfully to your email.", "sent": True})


@api_view(['POST'])
def verify_otp_view(request):
    """
    Endpoint: POST /api/password-reset/verify-otp/
    Input: { "email": "...", "otp": "...", "new_password": "...", "confirm_password": "..." }
    """
    serializer = VerifyOtpSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"detail": "Invalid input"}, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower()
    otp = serializer.validated_data['otp']
    new_password = serializer.validated_data['new_password']
    confirm_password = serializer.validated_data['confirm_password']

    # ✅ Step 1: Validate password
    if new_password != confirm_password:
        return Response({"detail": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8 or not any(c.isdigit() for c in new_password) or not any(c.isalpha() for c in new_password):
        return Response({"detail": "Password must be at least 8 characters long and include letters and numbers."},
                        status=status.HTTP_400_BAD_REQUEST)

    # ✅ Step 2: Verify OTP validity
    now = timezone.now()
    otp_entries = OTPCode.objects.filter(email=email, otp_code=otp, expiry_time__gte=now).order_by('-expiry_time')

    if not otp_entries.exists():
        return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Step 3: Update password
    try:
        with transaction.atomic():
            user = User.objects.get(email=email)
            user.password = make_password(new_password)
            user.save()
    except User.DoesNotExist:
        return Response({"detail": "User not found. Please register first."}, status=status.HTTP_404_NOT_FOUND)

    # ✅ Step 4: Clean up OTPs
    OTPCode.objects.filter(email=email).delete()

    return Response({"detail": "Password updated successfully."})
