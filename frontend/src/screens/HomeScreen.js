import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';
import { useTheme } from '../context/ThemeContext';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// Стили должны быть определены до использования в компонентах
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  offersCount: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerDate: {
    fontSize: 12,
    marginTop: 2,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillSection: {
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  teachTag: {},
  skillText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  locationText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

// Отдельный компонент для карточки предложения
const OfferCard = ({ item, index, colors, navigation }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: cardAnim,
        transform: [
          {
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => navigation.navigate('OfferDetail', { offer: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            <Image 
              source={{ uri: `https://api.dicebear.com/9.x/personas/png?seed=${item.userAvatarSeed || item.userAvatar || item.userName}` }} 
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.inputBackground }}
              placeholder={{ blurhash }}
              transition={1000}
            /> 
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
            <Text style={[styles.offerDate, { color: colors.textTertiary }]}>
              {new Date(item.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </View>

        <Text style={[styles.offerTitle, { color: colors.primary }]}>{item.title}</Text>
        <Text style={[styles.offerDescription, { color: colors.textSecondary }]}>{item.description}</Text>

        <View style={styles.skillsContainer}>
          <View style={styles.skillSection}>
            <Text style={[styles.skillLabel, { color: colors.textTertiary }]}>Хочу научиться:</Text>
            <View style={styles.skillsList}>
              {(Array.isArray(item.skillsToLearn) && item.skillsToLearn.length > 0 ? item.skillsToLearn : []).map((skill, skillIndex) => {
                const skillName = typeof skill === 'object' && skill !== null && skill.name 
                  ? skill.name 
                  : (typeof skill === 'string' && skill.trim() ? skill.trim() : String(skill || ''));
                if (!skillName) return null;
                return (
                  <View key={skillIndex} style={[styles.skillTag, { backgroundColor: colors.skillTagLearn }]}>
                    <Text style={[styles.skillText, { color: colors.text }]}>🎯 {skillName}</Text>
                  </View>
                );
              })}
              {(!item.skillsToLearn || !Array.isArray(item.skillsToLearn) || item.skillsToLearn.length === 0) && (
                <Text style={[styles.skillText, { color: colors.textTertiary, fontStyle: 'italic' }]}>Не указано</Text>
              )}
            </View>
          </View>

          <View style={styles.skillSection}>
            <Text style={[styles.skillLabel, { color: colors.textTertiary }]}>Могу научить:</Text>
            <View style={styles.skillsList}>
              {(Array.isArray(item.skillsToTeach) && item.skillsToTeach.length > 0 ? item.skillsToTeach : []).map((skill, skillIndex) => {
                const skillName = typeof skill === 'object' && skill !== null && skill.name 
                  ? skill.name 
                  : (typeof skill === 'string' && skill.trim() ? skill.trim() : String(skill || ''));
                if (!skillName) return null;
                return (
                  <View
                    key={skillIndex}
                    style={[styles.skillTag, styles.teachTag, { backgroundColor: colors.skillTagTeach }]}
                  >
                    <Text style={[styles.skillText, { color: colors.text }]}>💡 {skillName}</Text>
                  </View>
                );
              })}
              {(!item.skillsToTeach || !Array.isArray(item.skillsToTeach) || item.skillsToTeach.length === 0) && (
                <Text style={[styles.skillText, { color: colors.textTertiary, fontStyle: 'italic' }]}>Не указано</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.formatBadge, { backgroundColor: colors.inputBackground }]}>
            <Ionicons
              name={
                item.learningFormat === 'online'
                  ? 'wifi'
                  : item.learningFormat === 'offline'
                    ? 'location'
                    : 'phone-portrait'
              }
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.formatText, { color: colors.textSecondary }]}>
              {item.learningFormat === 'online'
                ? 'Онлайн'
                : item.learningFormat === 'offline'
                  ? 'Оффлайн'
                  : 'Оба формата'}
            </Text>
          </View>
          {item.location && <Text style={[styles.locationText, { color: colors.textSecondary }]}>{item.location}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { offers } = useSkill();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOffers, setFilteredOffers] = useState(offers || []);

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

  // Обновляем filteredOffers когда offers изменяется
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredOffers(offers || []);
    } else {
      const filtered = (offers || []).filter(
        (offer) =>
          offer.skillsToLearn?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
          offer.skillsToTeach?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
          offer.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredOffers(filtered);
    }
  }, [offers, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredOffers(offers);
    } else {
      const filtered = offers.filter(
        (offer) =>
          offer.skillsToLearn.some((skill) => skill.toLowerCase().includes(query.toLowerCase())) ||
          offer.skillsToTeach.some((skill) => skill.toLowerCase().includes(query.toLowerCase())) ||
          offer.title.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredOffers(filtered);
    }
  };

  const renderOfferCard = ({ item, index }) => (
    <OfferCard item={item} index={index} colors={colors} navigation={navigation} />
  );

  if (!colors) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
            },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Найти навыки..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {filteredOffers && filteredOffers.length > 0 ? (
          <FlatList
            data={filteredOffers}
            renderItem={renderOfferCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={[styles.offersCount, { color: colors.textSecondary }]}>
                  {filteredOffers.length} предложений
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Нет доступных предложений</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
