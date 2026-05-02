from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Contact, SliderImage
from .serializers import ContactSerializer, SliderImageSerializer
from .notifications import send_notification_email, send_sms_notification
import logging

logger = logging.getLogger(__name__)

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            if response.status_code == 201:
                # Send email notification
                email_sent = send_notification_email(response.data)
                if not email_sent:
                    logger.warning("Failed to send email notification")
                    
                # Send SMS notification
                sms_sent = send_sms_notification(response.data)
                if not sms_sent:
                    logger.warning("Failed to send SMS notification")
            return response
        except Exception as e:
            logger.error(f"Error in ContactViewSet create: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
def create_contact(request):
    try:
        logger.info(f"Received contact form data: {request.data}")
        serializer = ContactSerializer(data=request.data)
        
        if serializer.is_valid():
            contact = serializer.save()
            logger.info(f"Contact saved successfully: {contact.id}")
            
            # Send email notification
            email_sent = send_notification_email(serializer.data)
            if not email_sent:
                logger.warning("Failed to send email notification")
                
            # Send SMS notification
            sms_sent = send_sms_notification(serializer.data)
            if not sms_sent:
                logger.warning("Failed to send SMS notification")
                
            return Response({
                'message': 'Contact form submitted successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in create_contact: {str(e)}")
        return Response(
            {'error': 'An error occurred while processing your request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def list_contacts(request):
    try:
        contacts = Contact.objects.all()
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in list_contacts: {str(e)}")
        return Response(
            {'error': 'An error occurred while fetching contacts'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class SliderImageView(viewsets.ReadOnlyModelViewSet):
    queryset = SliderImage.objects.filter(is_active=True)
    serializer_class = SliderImageSerializer

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in SliderImageView list: {str(e)}")
            return Response(
                {'error': 'An error occurred while fetching slider images'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 