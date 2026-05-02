from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, SliderImageView, create_contact

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('slider-images/', SliderImageView.as_view({'get': 'list'}), name='slider-images'),
    path('create-contact/', create_contact, name='create-contact'),
] 