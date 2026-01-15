from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Skillset, Offer, Chat, Message


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'name', 'surname', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'email', 'name', 'surname']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ('name', 'surname', 'photo', 'skillset')}),
    )
    filter_horizontal = ['skillset']


@admin.register(Skillset)
class SkillsetAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'learning_format', 'is_active', 'created_at']
    list_filter = ['learning_format', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'user__username']
    filter_horizontal = ['skills_to_learn', 'skills_to_teach']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_participants', 'created_at', 'updated_at']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at', 'updated_at']

    def get_participants(self, obj):
        return ', '.join([p.username for p in obj.participants.all()])
    get_participants.short_description = 'Участники'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'chat', 'sender', 'text_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['text', 'sender__username']
    readonly_fields = ['created_at']

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Текст'


from django_eventstream.models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['channel', 'type', 'created']
    list_filter = ['channel', 'type']
    search_fields = ['channel', 'data']
    readonly_fields = ['id', 'created']
    
    def has_add_permission(self, request):
        return False  # Нельзя добавлять события вручную
    
    def has_change_permission(self, request, obj=None):
        return False  # Нельзя изменять события