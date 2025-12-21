from django.urls import path, include
from django_eventstream.viewsets import EventsViewSet, configure_events_view_set
from rest_framework.routers import DefaultRouter
from .views import (
    SignUpView,
    SignInView,
    UserProfileView,
    OfferViewSet,
    ChatViewSet,
    MessageViewSet,
    SkillsetViewSet,
)
from django_eventstream import urls as eventstream_urls

router = DefaultRouter()
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'chats', ChatViewSet, basename='chat')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'skills', SkillsetViewSet, basename='skill')

urlpatterns = [
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/signin/', SignInView.as_view(), name='signin'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('events/', include(eventstream_urls)),
    path('', include(router.urls)),
]