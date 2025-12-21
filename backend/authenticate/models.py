from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class Skillset(models.Model):
    name = models.CharField(max_length=100, verbose_name='Навыки', unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Навык'
        verbose_name_plural = 'Навыки'


class CustomUser(AbstractUser):
    username = models.CharField(verbose_name='Имя пользователя', max_length=150, null=False, unique=True)
    email = models.EmailField(unique=True, null=True, default=None, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    name = models.CharField(verbose_name='Имя', max_length=150, null=True, default=None, blank=True)
    surname = models.CharField(verbose_name='Фамилия', max_length=150, null=True, default=None, blank=True)
    photo = models.ImageField(verbose_name='Фото', upload_to='worker_images', null=True, blank=True)
    skillset = models.ManyToManyField(Skillset, help_text="Навыки пользователя", blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    avatar_seed = models.CharField(max_length=150, blank=True, null=True)
    
    USERNAME_FIELD = "username"

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def get_privs(self):
        return []

    def get_name(self):
        if self.name and self.surname:
            return f'{self.name} {self.surname}'
        return self.username

    def get_avatar_text(self):
        """Генерирует текст для аватара из имени"""
        if self.name:
            return self.name[0].upper()
        if self.surname:
            return self.surname[0].upper()
        return self.username[0].upper() if self.username else 'U'

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def save(self, *args, **kwargs):
        if not self.avatar_seed and self.username:
            self.avatar_seed = self.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.username}'


class Offer(models.Model):
    LEARNING_FORMAT_CHOICES = [
        ('online', 'Онлайн'),
        ('offline', 'Оффлайн'),
        ('both', 'Оба формата'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='offers', verbose_name='Пользователь')
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    skills_to_learn = models.ManyToManyField(Skillset, related_name='offers_to_learn', verbose_name='Навыки для изучения')
    skills_to_teach = models.ManyToManyField(Skillset, related_name='offers_to_teach', verbose_name='Навыки для обучения')
    learning_format = models.CharField(max_length=10, choices=LEARNING_FORMAT_CHOICES, default='online', verbose_name='Формат обучения')
    location = models.CharField(max_length=200, null=True, blank=True, verbose_name='Местоположение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    is_active = models.BooleanField(default=True, verbose_name='Активна')

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.user.username}'


class Chat(models.Model):
    participants = models.ManyToManyField(CustomUser, related_name='chats', verbose_name='Участники')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Чат'
        verbose_name_plural = 'Чаты'
        ordering = ['-updated_at']

    def __str__(self):
        participants_list = ', '.join([p.username for p in self.participants.all()[:2]])
        return f'Чат: {participants_list}'

    def get_other_participant(self, user):
        """Получить другого участника чата"""
        return self.participants.exclude(id=user.id).first()


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages', verbose_name='Чат')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='Отправитель')
    text = models.TextField(verbose_name='Текст сообщения', blank=True)
    image = models.ImageField(upload_to='chat_images', null=True, blank=True, verbose_name='Изображение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.username}: {self.text[:50]}...' if len(self.text) > 50 else f'{self.sender.username}: {self.text}'