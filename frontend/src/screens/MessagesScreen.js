import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';

const ChatsScreen = ({ navigation }) => {
  const { getMyChats, markAsRead } = useSkill();
  const chats = getMyChats();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Меньше суток
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diff < 604800000) { // Меньше недели
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const handleChatPress = (chat) => {
    markAsRead(chat.id);
    navigation.navigate('Chat', { 
      chatId: chat.id, 
      participantName: chat.participantName 
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.participantAvatar}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.participantName}
          </Text>
          <Text style={styles.chatTime}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.chatPreview}>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={2}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Список чатов */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.chatsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#e0e0e0" />
            <Text style={styles.emptyStateTitle}>Нет чатов</Text>
            <Text style={styles.emptyStateText}>
              Начните общение, откликнувшись{'\n'}
              на одну из заявок
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  newChatButton: {
    padding: 4,
  },
  chatsList: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e9ecef',
    textAlign: 'center',
    lineHeight: 48,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  chatTime: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatsScreen;