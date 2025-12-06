import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';
import { useTheme, triggerHaptic } from '../context/ThemeContext';

const OfferDetailScreen = ({ route, navigation }) => {
  const { offer } = route.params || {};
  const { createChat } = useSkill();
  const { colors } = useTheme();
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!offer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Заявка не найдена</Text>
      </View>
    );
  }

  const handleContact = () => {
    triggerHaptic();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Основной ScrollView */}
      <Animated.ScrollView 
        style={[styles.scrollView, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.card, { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.shadow,
        }]}>
          {/* Информация о пользователе */}
          <View style={styles.userSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{offer.userAvatar}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{offer.userName}</Text>
              <Text style={[styles.postDate, { color: colors.textTertiary }]}>{getCreatedAt()}</Text>
            </View>
          </View>

          {/* Заголовок заявки */}
          <Text style={[styles.title, { color: colors.primary }]}>{offer.title}</Text>

          {/* Описание */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Описание</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{offer.description}</Text>
          </View>

          {/* Навыки для изучения */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Хочет научиться</Text>
            <View style={styles.skillsContainer}>
              {offer.skillsToLearn && offer.skillsToLearn.map((skill, index) => (
                <View key={index} style={[styles.skillTag, { backgroundColor: colors.skillTagLearn }]}>
                  <Ionicons name="arrow-forward-circle" size={16} color={colors.primary} />
                  <Text style={[styles.skillText, { color: colors.primary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Навыки для обучения */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Может научить</Text>
            <View style={styles.skillsContainer}>
              {offer.skillsToTeach && offer.skillsToTeach.map((skill, index) => (
                <View key={index} style={[styles.skillTag, styles.teachTag, { backgroundColor: colors.skillTagTeach }]}>
                  <Ionicons name="school" size={16} color={colors.secondary} />
                  <Text style={[styles.skillText, styles.teachText, { color: colors.secondary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Дополнительная информация */}
          <View style={[styles.detailsSection, { borderTopColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Опубликовано:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{getCreatedAt()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons 
                name={offer.learningFormat === 'online' ? 'wifi' : 
                      offer.learningFormat === 'offline' ? 'location' : 'phone-portrait'} 
                size={18} 
                color={colors.textSecondary} 
              />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Формат:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {offer.learningFormat === 'online' ? 'Онлайн' : 
                 offer.learningFormat === 'offline' ? 'Оффлайн' : 'Оба формата'}
              </Text>
            </View>

            {offer.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Местоположение:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{offer.location}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Фиксированная кнопка */}
      <SafeAreaView style={[styles.footer, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      }]}>
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={handleContact}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          <Text style={styles.contactButtonText}>Написать</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Место для кнопки с учётом safe area
  },
  card: {
    margin: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    elevation: 2,
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
    marginBottom: 4,
  },
  postDate: {
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  teachTag: {
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  teachText: {
  },
  detailsSection: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 10,
    marginRight: 8,
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    marginTop: 40,
  },
});

export default OfferDetailScreen;