import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';

const OfferDetailScreen = ({ route, navigation }) => {
  const { offer } = route.params || {};
  const { createChat } = useSkill();

  if (!offer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Заявка не найдена</Text>
      </View>
    );
  }

  const handleContact = () => {
    const chatId = createChat(
      offer.userId, 
      offer.userName, 
      offer.userAvatar
    );
    navigation.navigate('Chat', { 
      chatId, 
      participantName: offer.userName 
    });
  };

  const getCreatedAt = () => {
    if (!offer.createdAt) return 'Неизвестно';
    if (offer.createdAt instanceof Date) {
      return offer.createdAt.toLocaleDateString('ru-RU');
    }
    try {
      return new Date(offer.createdAt).toLocaleDateString('ru-RU');
    } catch {
      return 'Неизвестно';
    }
  };

  return (
    <View style={styles.container}>
      {/* Основной ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.card}>
          {/* Информация о пользователе */}
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{offer.userAvatar}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{offer.userName}</Text>
              <Text style={styles.postDate}>{getCreatedAt()}</Text>
            </View>
          </View>

          {/* Заголовок заявки */}
          <Text style={styles.title}>{offer.title}</Text>

          {/* Описание */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{offer.description}</Text>
          </View>

          {/* Навыки для изучения */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Хочет научиться</Text>
            <View style={styles.skillsContainer}>
              {offer.skillsToLearn && offer.skillsToLearn.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Ionicons name="arrow-forward-circle" size={16} color="#007AFF" />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Навыки для обучения */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Может научить</Text>
            <View style={styles.skillsContainer}>
              {offer.skillsToTeach && offer.skillsToTeach.map((skill, index) => (
                <View key={index} style={[styles.skillTag, styles.teachTag]}>
                  <Ionicons name="school" size={16} color="#28a745" />
                  <Text style={[styles.skillText, styles.teachText]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Дополнительная информация */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.detailLabel}>Опубликовано:</Text>
              <Text style={styles.detailValue}>{getCreatedAt()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons 
                name={offer.learningFormat === 'online' ? 'wifi' : 
                      offer.learningFormat === 'offline' ? 'location' : 'phone-portrait'} 
                size={18} 
                color="#666" 
              />
              <Text style={styles.detailLabel}>Формат:</Text>
              <Text style={styles.detailValue}>
                {offer.learningFormat === 'online' ? 'Онлайн' : 
                 offer.learningFormat === 'offline' ? 'Оффлайн' : 'Оба формата'}
              </Text>
            </View>

            {offer.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.detailLabel}>Местоположение:</Text>
                <Text style={styles.detailValue}>{offer.location}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Фиксированная кнопка */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={handleContact}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text style={styles.contactButtonText}>Написать</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Место для кнопки
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 13,
    color: '#999',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    lineHeight: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  teachTag: {
    backgroundColor: '#E8F5E8',
  },
  skillText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
    marginLeft: 6,
  },
  teachText: {
    color: '#28a745',
  },
  detailsSection: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginRight: 8,
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default OfferDetailScreen;