import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const SearchScreen = ({ navigation }) => {
  const { searchOffers, createChat, user } = useSkill();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchOffers(searchQuery);
  }, [searchQuery, searchOffers]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setIsSearching(text.length > 0);
  };

  const handleContact = async (offer) => {
    try {
      const chatId = await createChat(offer.userId, offer.userName, offer.userAvatar);
      if (chatId) {
        navigation.navigate('Chat', { 
          chatId: String(chatId), 
          participantName: String(offer.userName || 'Пользователь'),
          participantAvatarSeed: offer.userAvatarSeed || offer.userAvatar || offer.userName || ''
        });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const renderOfferItem = ({ item }) => (
    <TouchableOpacity style={styles.offerCard} onPress={() => navigation.navigate('OfferDetail', { offer: item })}>
      <View style={styles.offerHeader}>
        <Image
          source={{ uri: `https://api.dicebear.com/9.x/personas/png?seed=${item.userAvatarSeed || item.userAvatar || item.userName}` }}
          style={styles.offerAvatar}
          placeholder={{ blurhash }}
          transition={1000}
        />
        <View style={styles.offerUserInfo}>
          <Text style={styles.offerUserName}>{item.userName}</Text>
          <Text style={styles.offerDate}>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</Text>
        </View>
        <TouchableOpacity style={styles.contactButton} onPress={() => handleContact(item)}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.offerTitle}>{item.title}</Text>
      <Text style={styles.offerDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.skillsContainer}>
        <View style={styles.skillsColumn}>
          <Text style={styles.skillsLabel}>Ищу:</Text>
          <View style={styles.skillsList}>
            {item.skillsToLearn.slice(0, 3)?.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>🎯 {skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.skillsColumn}>
          <Text style={styles.skillsLabel}>Предлагаю:</Text>
          <View style={styles.skillsList}>
            {item.skillsToTeach.slice(0, 3)?.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>💡 {skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.offerFooter}>
        <View style={styles.formatTag}>
          <Ionicons
            name={
              item.learningFormat === 'online'
                ? 'laptop'
                : item.learningFormat === 'offline'
                  ? 'location'
                  : 'phone-portrait'
            }
            size={12}
            color="#666"
          />
          <Text style={styles.formatText}>
            {item.learningFormat === 'online'
              ? 'Онлайн'
              : item.learningFormat === 'offline'
                ? 'Оффлайн'
                : 'Оба формата'}
          </Text>
        </View>
        {item.location && <Text style={styles.locationText}>{item.location}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Поисковая строка */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Найти заявку..."
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              Keyboard.dismiss();
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Результаты поиска */}
      {isSearching ? (
        <FlatList
          data={searchResults}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>Ничего не найдено</Text>
              <Text style={styles.emptyStateText}>Попробуйте изменить запрос</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.initialState}>
          <Ionicons name="search-outline" size={80} color="#e0e0e0" />
          <Text style={styles.initialStateTitle}>Найдите подходящие заявки по навыкам</Text>
          <Text style={styles.initialStateText}>Поиск понимает русский и английский</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  offerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  offerUserInfo: {
    flex: 1,
  },
  offerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  offerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  contactButton: {
    padding: 8,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  skillsColumn: {
    flex: 1,
  },
  skillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
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
    marginBottom: 6,
  },
  skillText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '500',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formatText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  initialStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  initialStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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

export default SearchScreen;
