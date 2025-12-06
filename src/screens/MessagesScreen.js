import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';
import { useTheme } from '../context/ThemeContext';

const ChatsScreen = ({ navigation }) => {
  const { getMyChats, markAsRead } = useSkill();
  const { colors } = useTheme();
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
      style={[styles.chatItem, { borderBottomColor: colors.border }]}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={[styles.avatar, { backgroundColor: colors.inputBackground }]}>{item.participantAvatar}</Text>
        {item.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadCount}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
            {item.participantName}
          </Text>
          <Text style={[styles.chatTime, { color: colors.textTertiary }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.chatPreview}>
          <Text 
            style={[
              styles.lastMessage,
              { color: colors.textSecondary },
              item.unreadCount > 0 && [styles.unreadMessage, { color: colors.text, fontWeight: '500' }]
            ]} 
            numberOfLines={2}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Чаты</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
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
            <Ionicons name="chatbubble-ellipses-outline" size={80} color={colors.textTertiary} />
            <Text style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>Нет чатов</Text>
            <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>
              Начните общение, откликнувшись{'\n'}
              на одну из заявок
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
    textAlign: 'center',
    lineHeight: 48,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
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
    flex: 1,
  },
  chatTime: {
    fontSize: 13,
    marginLeft: 8,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  unreadMessage: {
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ChatsScreen;