# views.py
from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import login, logout, get_user_model
from django.db.models import Q
from .models import CustomUser, Offer, Chat, Message, Skillset
from .serializer import (
    UserSerializer, LoginSerializer, OfferSerializer,
    ChatSerializer, MessageSerializer, SkillsetSerializer
)
from .utils import send_new_message_event,send_chat_update_event
User = get_user_model()
from django.http import HttpResponse

class SignUpView(APIView):
    """
    Регистрация нового пользователя
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Автоматический логин после регистрации (опционально)
            login(request, user)

            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SignInView(APIView):
    """
    Вход пользователя
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)

            # Получаем информацию о сессии
            session_info = {
                'session_key': request.session.session_key,
                'user_id': request.user.id,
            }

            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'session': session_info
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)


class SignOutView(APIView):
    """
    Выход пользователя
    """

    def post(self, request):
        logout(request)
        return Response({
            'success': True,
            'message': 'Logout successful'
        })


class UserProfileView(APIView):
    """
    Получить/обновить профиль текущего пользователя
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response({
            'success': True,
            'user': serializer.data
        })

    def put(self, request):
        # Если пришли названия навыков, создаем их если не существуют
        if 'skill_names' in request.data:
            skill_names = request.data.pop('skill_names', [])
            if isinstance(skill_names, str):
                skill_names = [s.strip() for s in skill_names.split(',') if s.strip()]
            
            skill_ids = []
            for skill_name in skill_names:
                skill, created = Skillset.objects.get_or_create(name=skill_name)
                skill_ids.append(skill.id)
            
            # Добавляем IDs навыков в данные для сериализатора
            request.data['skillset_ids'] = skill_ids
        
        serializer = UserSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class OfferViewSet(viewsets.ModelViewSet):
    """
    CRUD операции для заявок
    """
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Offer.objects.filter(is_active=True).select_related('user').prefetch_related(
            'skills_to_learn', 'skills_to_teach'
        )
        
        # Фильтрация по навыкам
        skills = self.request.query_params.get('skills', None)
        if skills:
            skill_list = [s.strip() for s in skills.split(',')]
            queryset = queryset.filter(
                Q(skills_to_learn__name__in=skill_list) |
                Q(skills_to_teach__name__in=skill_list)
            ).distinct()
        
        # Поиск по тексту
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset

    def create(self, request, *args, **kwargs):
        # Обрабатываем названия навыков перед валидацией
        skill_names_to_learn = None
        skill_names_to_teach = None
        
        # Копируем request.data для безопасной обработки
        data = request.data.copy()
        
        if 'skill_names_to_learn' in data:
            skill_names_to_learn = data.pop('skill_names_to_learn', [])
            if isinstance(skill_names_to_learn, str):
                skill_names_to_learn = [s.strip() for s in skill_names_to_learn.split(',') if s.strip()]
        
        if 'skill_names_to_teach' in data:
            skill_names_to_teach = data.pop('skill_names_to_teach', [])
            if isinstance(skill_names_to_teach, str):
                skill_names_to_teach = [s.strip() for s in skill_names_to_teach.split(',') if s.strip()]
        
        # Создаем навыки и получаем их IDs
        if skill_names_to_learn:
            skill_ids = []
            for skill_name in skill_names_to_learn:
                if skill_name:  # Проверка на пустую строку
                    skill, created = Skillset.objects.get_or_create(name=skill_name)
                    skill_ids.append(skill.id)
            
            # Устанавливаем IDs навыков
            if skill_ids:
                data['skills_to_learn_ids'] = skill_ids
        
        if skill_names_to_teach:
            skill_ids = []
            for skill_name in skill_names_to_teach:
                if skill_name:  # Проверка на пустую строку
                    skill, created = Skillset.objects.get_or_create(name=skill_name)
                    skill_ids.append(skill.id)
            
            # Устанавливаем IDs навыков
            if skill_ids:
                data['skills_to_teach_ids'] = skill_ids
        
        # Создаем сериализатор с обновленными данными
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_update(self, serializer):
        # Если пришли названия навыков, создаем их если не существуют
        if 'skill_names_to_learn' in self.request.data:
            skill_names = self.request.data.pop('skill_names_to_learn', [])
            if isinstance(skill_names, str):
                skill_names = [s.strip() for s in skill_names.split(',') if s.strip()]
            
            skill_ids = []
            for skill_name in skill_names:
                skill, created = Skillset.objects.get_or_create(name=skill_name)
                skill_ids.append(skill.id)
            
            # Добавляем IDs навыков
            if 'skills_to_learn_ids' not in self.request.data:
                self.request.data['skills_to_learn_ids'] = []
            self.request.data['skills_to_learn_ids'].extend(skill_ids)
        
        if 'skill_names_to_teach' in self.request.data:
            skill_names = self.request.data.pop('skill_names_to_teach', [])
            if isinstance(skill_names, str):
                skill_names = [s.strip() for s in skill_names.split(',') if s.strip()]
            
            skill_ids = []
            for skill_name in skill_names:
                skill, created = Skillset.objects.get_or_create(name=skill_name)
                skill_ids.append(skill.id)
            
            # Добавляем IDs навыков
            if 'skills_to_teach_ids' not in self.request.data:
                self.request.data['skills_to_teach_ids'] = []
            self.request.data['skills_to_teach_ids'].extend(skill_ids)
        
        # Проверяем что пользователь может обновлять только свои заявки
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own offers.")
        
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Проверяем что пользователь может удалять только свои заявки
        if instance.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own offers.")
        
        # Мягкое удаление - помечаем как неактивную
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatViewSet(viewsets.ModelViewSet):
    """
    CRUD операции для чатов
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(participants=self.request.user).prefetch_related(
            'participants', 'messages__sender'
        ).distinct()

    def perform_create(self, serializer):
        participant_ids = self.request.data.get('participant_ids', [])
        
        # Проверяем, что пользователь не пытается создать чат сам с собой
        current_user_id = self.request.user.id
        if current_user_id in participant_ids:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("You cannot create a chat with yourself")

        
        chat = serializer.save()
        # Добавляем текущего пользователя в участники
        chat.participants.add(self.request.user)
        # Добавляем других участников если указаны
        for participant_id in participant_ids:
            try:
                participant = CustomUser.objects.get(id=participant_id)
                # Еще раз проверяем, что это не текущий пользователь
                if participant.id != current_user_id:
                    chat.participants.add(participant)
            except CustomUser.DoesNotExist:
                pass

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Проверяем, что пользователь является участником чата
        if request.user not in instance.participants.all():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete chats you participate in.")
        
        # Удаляем чат (и все связанные сообщения через CASCADE)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Получить сообщения чата"""
        chat = self.get_object()
        messages = chat.messages.select_related('sender').order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response({
            'success': True,
            'messages': serializer.data
        })


class MessageViewSet(viewsets.ModelViewSet):
    """
    CRUD операции для сообщений
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Добавляем поддержку multipart/form-data для загрузки изображений
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        chat_id = self.request.query_params.get('chat_id', None)
        if chat_id:
            return Message.objects.filter(chat_id=chat_id).select_related('sender', 'chat')
        return Message.objects.filter(chat__participants=self.request.user).select_related('sender', 'chat')

    def perform_create(self, serializer):
        # Получаем chat_id из данных (может быть строкой или числом)
        chat_id = self.request.data.get('chat')
        if chat_id:
            try:
                chat_id = int(chat_id)  # Преобразуем в число если это строка
                chat = Chat.objects.get(id=chat_id, participants=self.request.user)
                message = serializer.save(sender=self.request.user, chat=chat)
                # Обновляем время последнего обновления чата
                chat.save()
           
                # Отправляем событие всем участникам чата 
                send_new_message_event(message.chat.id)

                return message
            except (Chat.DoesNotExist, ValueError, TypeError) as e:
                from rest_framework import serializers as drf_serializers
                print(str(e))
                raise drf_serializers.ValidationError({
                    "detail": str(e),
                        "exception": e.__class__.__name__
                    })

        else:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError("Chat ID is required")


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Отметить сообщение как прочитанное"""
        message = self.get_object()
        if message.chat.participants.filter(id=request.user.id).exists():
            message.is_read = True
            message.save()
            return Response({'success': True, 'message': 'Message marked as read'})
        return Response(
            {'success': False, 'message': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )


class SkillsetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Получить список навыков
    """
    queryset = Skillset.objects.all()
    serializer_class = SkillsetSerializer
    permission_classes = [permissions.AllowAny]


def ok_view(request):
    return HttpResponse("OK", status=200)