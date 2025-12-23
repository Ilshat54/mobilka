from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Skillset, Offer, Chat, Message
from django.conf import settings


class SkillsetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skillset
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    skillset = SkillsetSerializer(many=True, read_only=True)
    skillset_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Skillset.objects.all(), 
        write_only=True, 
        required=False,
        source='skillset'
    )
    avatar_text = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'password2', 
            'name', 'surname', 'photo', 'skillset', 'skillset_ids',
            'avatar_text', 'avatar_seed', 'full_name', 'created_at'
        ]
        extra_kwargs = {
            'email': {'required': False},
            'photo': {'required': False},
        }
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Удаляем password2 из данных
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        
        # Создаем пользователя
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=password,
            name=validated_data.get('name'),
            surname=validated_data.get('surname'),
        )
        
        # Добавляем навыки если указаны
        if 'skillset' in validated_data:
            user.skillset.set(validated_data['skillset'])

        return user

    def update(self, instance, validated_data):
        # Обновляем основные поля (только если они пришли)
        if 'name' in validated_data:
            instance.name = validated_data.get('name')
        if 'surname' in validated_data:
            instance.surname = validated_data.get('surname')
        if 'email' in validated_data:
            instance.email = validated_data.get('email')
        if 'username' in validated_data:
            instance.username = validated_data.get('username')
        
        # Обновляем навыки, если пришли (skillset_ids автоматически преобразуется в skillset через source)
        if 'skillset' in validated_data:
            skillset = validated_data.get('skillset')
            instance.skillset.set(skillset if skillset else [])
        
        instance.save()

        # Обновляем фото если есть
        if 'photo' in validated_data:
            instance.photo = validated_data['photo']
            instance.save()

        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        return data


class OfferSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='user',
        write_only=True,
        required=False
    )
    skills_to_learn = SkillsetSerializer(many=True, read_only=True)
    skills_to_learn_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skillset.objects.all(),
        write_only=True,
        required=False,
        source='skills_to_learn'
    )
    skills_to_teach = SkillsetSerializer(many=True, read_only=True)
    skills_to_teach_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skillset.objects.all(),
        write_only=True,
        required=False,
        source='skills_to_teach'
    )

    class Meta:
        model = Offer
        fields = [
            'id', 'user', 'user_id', 'title', 'description',
            'skills_to_learn', 'skills_to_learn_ids',
            'skills_to_teach', 'skills_to_teach_ids',
            'learning_format', 'location', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Получаем навыки для изучения и обучения
        skills_to_learn_ids = validated_data.pop('skills_to_learn', [])
        skills_to_teach_ids = validated_data.pop('skills_to_teach', [])
        
        # Создаем заявку
        offer = Offer.objects.create(**validated_data)
        
        # Добавляем навыки (может быть пустым списком, но это нормально)
        if skills_to_learn_ids:
            offer.skills_to_learn.set(skills_to_learn_ids)
        else:
            offer.skills_to_learn.clear()
        
        if skills_to_teach_ids:
            offer.skills_to_teach.set(skills_to_teach_ids)
        else:
            offer.skills_to_teach.clear()
        
        return offer

    def update(self, instance, validated_data):
        # Получаем навыки для изучения и обучения
        skills_to_learn_ids = validated_data.pop('skills_to_learn', None)
        skills_to_teach_ids = validated_data.pop('skills_to_teach', None)
        
        # Обновляем остальные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Обновляем навыки если они были переданы
        if skills_to_learn_ids is not None:
            if skills_to_learn_ids:
                instance.skills_to_learn.set(skills_to_learn_ids)
            else:
                instance.skills_to_learn.clear()
        
        if skills_to_teach_ids is not None:
            if skills_to_teach_ids:
                instance.skills_to_teach.set(skills_to_teach_ids)
            else:
                instance.skills_to_teach.clear()
        
        return instance


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        source='sender',
        write_only=True,
        required=False
    )
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'chat', 'sender', 'sender_id', 'text', 'image', 'image_url',
            'created_at', 'is_read'
        ]
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request')
        if not request:
            return obj.image.url

        scheme = 'http' if settings.MODE == 'DEV' else 'https'
        return f"{scheme}://{request.get_host()}{obj.image.url}"


class ChatSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=CustomUser.objects.all(),
        write_only=True,
        required=False,
        source='participants'
    )
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            'id', 'participants', 'participant_ids', 'other_participant',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_participant(request.user)
            if other:
                return {
                    'id': other.id,
                    'username': other.username,
                    'name': other.name,
                    'surname': other.surname,
                    'avatar_text': other.get_avatar_text(),
                    'photo': other.photo.url if other.photo else None,
                }
        return None

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0