import React, { useState, useRef, useEffect } from 'react';
import EventSource from 'react-native-sse';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSkill } from '../context/SkillContext';
import { useTheme, triggerHaptic } from '../context/ThemeContext';
import { API_BASE_URL } from '../services/api';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, participantName, participantAvatarSeed } = route.params || {};
  const { getChat, sendMessage, deleteChat } = useSkill();
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Загружаем чат при монтировании
  useEffect(() => {
    if (chatId) {
      loadChat();
    }
  }, [chatId]);

  useEffect(() => {
    const url = `${API_BASE_URL}/events/?channel=chat-${chatId}`;

    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    eventSource.addEventListener('open', (event) => {
      console.log('Open SSE connection.');
    });

    eventSource.addEventListener('message', async () => {
      await loadChat(chatId);
    });

    eventSource.addEventListener('error', (event) => {
      if (event.type === 'error') {
        console.error('Connection error:', event.message);
      } else if (event.type === 'exception') {
        console.error('Error:', event.message, event.error);
      }
    });

    eventSource.addEventListener('close', (event) => {
      console.log('Close SSE connection.');
    });

    return () => {
      console.log('Cleaning up SSE connection');
      eventSource.close();
    };
  }, []);

  const loadChat = async () => {
    if (!chatId) return;
    try {
      const chatIdStr = String(chatId);
      const chatData = await getChat(chatIdStr);
      if (chatData) {
        setChat(chatData);
        setMessages(chatData.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleDeleteChat = () => {
    Alert.alert('Удалить чат', 'Вы уверены, что хотите удалить этот чат? Все сообщения будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteChat(chatId);
            navigation.goBack();
            Alert.alert('Успех', 'Чат удален');
          } catch (error) {
            Alert.alert('Ошибка', 'Не удалось удалить чат');
            console.error('Error deleting chat:', error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    // Прокрутка к последнему сообщению
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handlePickImage = async () => {
    try {
      // Запрашиваем разрешение
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к фотографиям');
        return;
      }

      // Открываем галерею
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;
    if (!chatId) return;

    triggerHaptic();
    const messageText = message.trim();
    const imageToSend = selectedImage;

    // Очищаем поля сразу для лучшего UX
    setMessage('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const chatIdStr = String(chatId);
      const updatedChat = await sendMessage(chatIdStr, messageText || '', imageToSend);
    } catch (error) {
      // Восстанавливаем поля при ошибке
      setMessage(messageText);
      setSelectedImage(imageToSend);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }) => {
    console.log(item);
    const isMyMessage = item.senderId === 'me';
    const showDate =
      index === 0 ||
      new Date(item.timestamp).toDateString() !== new Date(messages[index - 1]?.timestamp).toDateString();

    return (
      <>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: colors.textTertiary }]}>
              {new Date(item.timestamp).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
        )}
        <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer]}>
          <View
            style={[
              styles.messageBubble,
              isMyMessage
                ? [styles.myMessage, { backgroundColor: colors.primary }]
                : [styles.theirMessage, { backgroundColor: colors.inputBackground }],
            ]}
          >
            {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />}
            {item.text && (
              <Text style={[styles.messageText, { color: isMyMessage ? 'white' : colors.text }]}>{item.text}</Text>
            )}
            <Text style={[styles.messageTime, { color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Image
            source={{ uri: `https://api.dicebear.com/9.x/personas/png?seed=${chat?.participantAvatarSeed || participantAvatarSeed || chat?.participantName || participantName || ''}` }}
            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: colors.inputBackground }}
            placeholder={{ blurhash }}
            transition={1000}
          />
          <Text style={[styles.headerName, { color: colors.text }]}>{chat?.participantName || participantName || 'Чат'}</Text>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={handleDeleteChat}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Сообщения */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={60} color={colors.textTertiary} />
              <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>Начните диалог</Text>
              <Text style={[styles.emptyChatHint, { color: colors.textTertiary }]}>Напишите первое сообщение</Text>
            </View>
          }
        />

        {/* Поле ввода */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder={selectedImage ? 'Добавьте текст к изображению (необязательно)...' : 'Сообщение...'}
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
              editable={!loading}
              returnKeyType={selectedImage ? 'send' : 'default'}
              blurOnSubmit={false}
              onSubmitEditing={selectedImage ? handleSend : undefined}
            />

            {message.trim() || selectedImage ? (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: !loading ? colors.primary : colors.inputBackground,
                  },
                ]}
                onPress={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: colors.inputBackground,
                    opacity: 0.5,
                  },
                ]}
                disabled={true}
              >
                <Ionicons name="send" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyChatHint: {
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
    marginHorizontal: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
});

export default ChatScreen;
