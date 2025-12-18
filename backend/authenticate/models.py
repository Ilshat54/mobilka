from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

ROLE_CHOICES = [
    ('HR', 'HR'),
    ('сотрудник', 'Сотрудник'),
]


class CustomUser(AbstractUser):
    username = models.CharField(verbose_name='Имя пользователя', max_length=150, null=False, unique=True)
    email = models.EmailField(unique=True, null=True, default=None, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    name = models.CharField(verbose_name='Имя', max_length=150, null=True, default=None, blank=True)
    surname = models.CharField(verbose_name='Фамилия', max_length=150, null=True, default=None, blank=True)
    role = models.CharField(max_length=100, verbose_name='Роль', choices=ROLE_CHOICES, default='сотрудник', null=False)
    photo = models.ImageField(verbose_name='Фото', upload_to='worker_images', null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True, verbose_name="Возраст")
    position = models.CharField(max_length=255, null=True, blank=True, verbose_name="Должность")

    objects = CustomUserManager()

    USERNAME_FIELD = "username"

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def get_privs(self):
        return []

    def get_name(self):
        return f'{self.name} {self.surname}'

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f'{self.username}'