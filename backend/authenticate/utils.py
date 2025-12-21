from django_eventstream import send_event
import json

def send_new_message_event(chat_id):
    """
    Отправить событие о новом сообщении всем участникам чата
    """
    event_data = {
        'type': 'new_message',
    }

    # Отправляем событие в канал чата
    send_event(f'chat-{chat_id}', 'message',event_data)

def send_chat_update_event(user_id, chat_data,):
    """
    Отправить событие об обновлении чата конкретному пользователю
    """
    event_data = {
        'type': 'chat_update',
        'data': chat_data
    }
    
    send_event(f'chat-{user_id}', 'chat', json.dumps(event_data))