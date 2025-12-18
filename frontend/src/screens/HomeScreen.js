import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';

const HomeScreen = ({ navigation }) => {
  const { offers } = useSkill();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOffers, setFilteredOffers] = useState(offers);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredOffers(offers);
    } else {
      const filtered = offers.filter(offer =>
        offer.skillsToLearn.some(skill => 
          skill.toLowerCase().includes(query.toLowerCase())
        ) ||
        offer.skillsToTeach.some(skill => 
          skill.toLowerCase().includes(query.toLowerCase())
        ) ||
        offer.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOffers(filtered);
    }
  };

  const renderOfferCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('OfferDetail', { offer: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userAvatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.offerDate}>
            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>

      <Text style={styles.offerTitle}>{item.title}</Text>
      <Text style={styles.offerDescription}>{item.description}</Text>

      <View style={styles.skillsContainer}>
        <View style={styles.skillSection}>
          <Text style={styles.skillLabel}>Хочу научиться:</Text>
          <View style={styles.skillsList}>
            {item.skillsToLearn.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>🎯 {skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.skillSection}>
          <Text style={styles.skillLabel}>Могу научить:</Text>
          <View style={styles.skillsList}>
            {item.skillsToTeach.map((skill, index) => (
              <View key={index} style={[styles.skillTag, styles.teachTag]}>
                <Text style={styles.skillText}>💡 {skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.formatBadge}>
          <Ionicons 
            name={item.learningFormat === 'online' ? 'wifi' : 
                  item.learningFormat === 'offline' ? 'location' : 'phone-portrait'} 
            size={14} 
            color="#666" 
          />
          <Text style={styles.formatText}>
            {item.learningFormat === 'online' ? 'Онлайн' : 
             item.learningFormat === 'offline' ? 'Оффлайн' : 'Оба формата'}
          </Text>
        </View>
        {item.location && (
          <Text style={styles.locationText}>{item.location}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Найти навыки..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Доступные обмены</Text>
          <Text style={styles.offersCount}>{filteredOffers.length} предложений</Text>
        </View>

        <FlatList
          data={filteredOffers}
          renderItem={renderOfferCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingTop: 8, // Добавили отступ от статус бара
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8, // Уменьшили верхний отступ
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
    color: '#333',
  },
  offersCount: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#007AFF',
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
    color: '#333',
  },
  offerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
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
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  teachTag: {
    backgroundColor: '#E8F5E8',
  },
  skillText: {
    fontSize: 12,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;