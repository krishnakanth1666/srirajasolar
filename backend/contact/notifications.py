from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

def send_notification_email(contact_data):
    """Send email notification for new contact form submission."""
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.error("Email settings are incomplete. Configure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env")
        return False

    subject = f"New Contact Form Submission from {contact_data['name']}"
    message = f"""
    New contact form submission received:
    
    Name: {contact_data['name']}
    Email: {contact_data['email']}
    Phone: {contact_data['phone']}
    Message: {contact_data['message']}
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        logger.info(f"Email notification sent successfully for {contact_data['email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")
        return False

def send_sms_notification(contact_data):
    """Send SMS notification for new contact form submission."""
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"""
            New contact form submission:
            Name: {contact_data['name']}
            Phone: {contact_data['phone']}
            Email: {contact_data['email']}
            """,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=settings.ADMIN_PHONE
        )
        logger.info(f"SMS notification sent successfully: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS notification: {str(e)}")
        return False 