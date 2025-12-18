import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const { user, offers, addOffer, deleteOffer, updateOffer, updateProfile, deleteProfile } = useSkill();
  const { colors, theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    skills: user?.skills?.join(', ') || '',
  });

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    skillsToLearn: '',
    skillsToTeach: '',
    learningFormat: 'online',
    location: '',
  });

  const [editingOffer, setEditingOffer] = useState({
    title: '',
    description: '',
    skillsToLearn: '',
    skillsToTeach: '',
    learningFormat: 'online',
    location: '',
  });

  // Функции для профиля
  const handleSaveProfile = () => {
    if (!userInfo.name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    const updatedData = {
      name: userInfo.name,
      skills: userInfo.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
    };
    
    updateProfile(user.id, updatedData);
    setIsEditing(false);
    Alert.alert('Успех', 'Профиль обновлен!');
  };

  const handleDeleteProfile = () => {
    deleteProfile(user.id);
    setShowDeleteModal(false);
    Alert.alert('Успех', 'Профиль удален');
  };

  // Функции для заявок
  const handleCreateOffer = () => {
    if (!newOffer.title || !newOffer.description || !newOffer.skillsToLearn || !newOffer.skillsToTeach) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    const offerData = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      title: newOffer.title,
      description: newOffer.description,
      skillsToLearn: newOffer.skillsToLearn.split(',').map(skill => skill.trim()),
      skillsToTeach: newOffer.skillsToTeach.split(',').map(skill => skill.trim()),
      learningFormat: newOffer.learningFormat,
      location: newOffer.location || undefined,
    };

    addOffer(offerData);
    setNewOffer({
      title: '',
      description: '',
      skillsToLearn: '',
      skillsToTeach: '',
      learningFormat: 'online',
      location: '',
    });
    Alert.alert('Успех', 'Заявка создана!');
  };

  const handleDeleteOffer = (offerId) => {
    Alert.alert(
      'Удаление заявки',
      'Вы уверены, что хотите удалить эту заявку?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            deleteOffer(offerId);
            Alert.alert('Успех', 'Заявка удалена');
          }
        }
      ]
    );
  };

  const handleEditOffer = (offer) => {
    setEditingOffer({
      title: offer.title,
      description: offer.description,
      skillsToLearn: offer.skillsToLearn.join(', '),
      skillsToTeach: offer.skillsToTeach.join(', '),
      learningFormat: offer.learningFormat,
      location: offer.location || '',
    });
    setIsEditingOffer(offer.id);
  };

  const handleSaveOffer = (offerId) => {
    if (!editingOffer.title || !editingOffer.description) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }

    const updatedData = {
      title: editingOffer.title,
      description: editingOffer.description,
      skillsToLearn: editingOffer.skillsToLearn.split(',').map(skill => skill.trim()),
      skillsToTeach: editingOffer.skillsToTeach.split(',').map(skill => skill.trim()),
      learningFormat: editingOffer.learningFormat,
      location: editingOffer.location || undefined,
    };

    updateOffer(offerId, updatedData);
    setIsEditingOffer(null);
    Alert.alert('Успех', 'Заявка обновлена!');
  };

  const handleCancelEdit = () => {
    setIsEditingOffer(null);
    setEditingOffer({
      title: '',
      description: '',
      skillsToLearn: '',
      skillsToTeach: '',
      learningFormat: 'online',
      location: '',
    });
  };

  const myOffers = offers.filter(offer => offer.userId === user.id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Заголовок с кнопкой удаления профиля и переключателем темы */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Профиль</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.themeButton}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={theme === 'dark' ? 'moon' : 'sunny'} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteProfileButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Информация пользователя */}
        <Animated.View 
          style={[
            styles.profileCard,
            { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.avatarSection}>
            <Text style={styles.avatar}>{user.avatar}</Text>
            <View style={styles.userInfo}>
              {isEditing ? (
                <TextInput
                  style={[styles.nameInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={userInfo.name}
                  onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
                  placeholder="Ваше имя"
                  placeholderTextColor={colors.textTertiary}
                />
              ) : (
                <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              )}
              <Text style={[styles.userId, { color: colors.textSecondary }]}>ID: {user.id}</Text>
            </View>
          </View>

          <View style={styles.skillsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои навыки</Text>
            {isEditing ? (
              <TextInput
                style={[styles.skillsInput, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.inputBackground,
                  color: colors.text 
                }]}
                value={userInfo.skills}
                onChangeText={(text) => setUserInfo({ ...userInfo, skills: text })}
                placeholder="Навыки через запятую"
                placeholderTextColor={colors.textTertiary}
                multiline
              />
            ) : (
              <View style={styles.skillsList}>
                {user.skills.map((skill, index) => (
                  <View key={index} style={[styles.skillTag, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.skillText, { color: colors.primary }]}>💡 {skill}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            <Ionicons 
              name={isEditing ? 'checkmark' : 'pencil'} 
              size={16} 
              color="white" 
            />
            <Text style={styles.editButtonText}>
              {isEditing ? 'Сохранить' : 'Редактировать профиль'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Мои заявки */}
        <Animated.View 
          style={[
            styles.section,
            { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои заявки</Text>
            <Text style={[styles.offersCount, { color: colors.textSecondary }]}>{myOffers.length} заявок</Text>
          </View>

          {myOffers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>У вас пока нет заявок</Text>
            </View>
          ) : (
            myOffers.map(offer => (
              <View key={offer.id} style={[styles.offerItem, { 
                backgroundColor: colors.inputBackground,
                borderLeftColor: colors.primary 
              }]}>
                {isEditingOffer === offer.id ? (
                  // Режим редактирования заявки
                  <View style={styles.editOfferForm}>
                    <TextInput
                      style={[styles.input, { 
                        borderColor: colors.border, 
                        backgroundColor: colors.inputBackground,
                        color: colors.text 
                      }]}
                      placeholder="Название заявки"
                      placeholderTextColor={colors.textTertiary}
                      value={editingOffer.title}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, title: text })}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea, { 
                        borderColor: colors.border, 
                        backgroundColor: colors.inputBackground,
                        color: colors.text 
                      }]}
                      placeholder="Описание"
                      placeholderTextColor={colors.textTertiary}
                      value={editingOffer.description}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, description: text })}
                      multiline
                    />
                    <TextInput
                      style={[styles.input, { 
                        borderColor: colors.border, 
                        backgroundColor: colors.inputBackground,
                        color: colors.text 
                      }]}
                      placeholder="Навыки для изучения"
                      placeholderTextColor={colors.textTertiary}
                      value={editingOffer.skillsToLearn}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, skillsToLearn: text })}
                    />
                    <TextInput
                      style={[styles.input, { 
                        borderColor: colors.border, 
                        backgroundColor: colors.inputBackground,
                        color: colors.text 
                      }]}
                      placeholder="Навыки для обучения"
                      placeholderTextColor={colors.textTertiary}
                      value={editingOffer.skillsToTeach}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, skillsToTeach: text })}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity 
                        style={[styles.saveButton, { backgroundColor: colors.secondary }]}
                        onPress={() => handleSaveOffer(offer.id)}
                      >
                        <Text style={styles.saveButtonText}>Сохранить</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.cancelButton, { backgroundColor: colors.textTertiary }]}
                        onPress={handleCancelEdit}
                      >
                        <Text style={styles.cancelButtonText}>Отмена</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Режим просмотра заявки
                  <>
                    <TouchableOpacity 
                      style={styles.offerContent}
                      onPress={() => navigation.navigate('OfferDetail', { offer })}
                    >
                      <Text style={[styles.offerItemTitle, { color: colors.text }]}>{offer.title}</Text>
                      <Text style={[styles.offerItemDate, { color: colors.textSecondary }]}>
                        {new Date(offer.createdAt).toLocaleDateString('ru-RU')}
                      </Text>
                      <View style={styles.offerStatus}>
                        <View style={[styles.statusDot, { backgroundColor: colors.secondary }]} />
                        <Text style={[styles.statusText, { color: colors.secondary }]}>Активна</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.offerActions}>
                      <TouchableOpacity 
                        style={styles.offerActionButton}
                        onPress={() => handleEditOffer(offer)}
                      >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.offerActionButton}
                        onPress={() => handleDeleteOffer(offer.id)}
                      >
                        <Ionicons name="trash" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </Animated.View>

        {/* Создание новой заявки */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Создать новую заявку</Text>
          
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                backgroundColor: colors.inputBackground,
                color: colors.text 
              }]}
              placeholder="Название заявки *"
              placeholderTextColor={colors.textTertiary}
              value={newOffer.title}
              onChangeText={(text) => setNewOffer({ ...newOffer, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                borderColor: colors.border, 
                backgroundColor: colors.inputBackground,
                color: colors.text 
              }]}
              placeholder="Описание *"
              placeholderTextColor={colors.textTertiary}
              value={newOffer.description}
              onChangeText={(text) => setNewOffer({ ...newOffer, description: text })}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                backgroundColor: colors.inputBackground,
                color: colors.text 
              }]}
              placeholder="Навыки, которым хочу научиться * (через запятую)"
              placeholderTextColor={colors.textTertiary}
              value={newOffer.skillsToLearn}
              onChangeText={(text) => setNewOffer({ ...newOffer, skillsToLearn: text })}
            />
            
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                backgroundColor: colors.inputBackground,
                color: colors.text 
              }]}
              placeholder="Навыки, которым могу научить * (через запятую)"
              placeholderTextColor={colors.textTertiary}
              value={newOffer.skillsToTeach}
              onChangeText={(text) => setNewOffer({ ...newOffer, skillsToTeach: text })}
            />
            
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                backgroundColor: colors.inputBackground,
                color: colors.text 
              }]}
              placeholder="Местоположение (необязательно)"
              placeholderTextColor={colors.textTertiary}
              value={newOffer.location}
              onChangeText={(text) => setNewOffer({ ...newOffer, location: text })}
            />

            <View style={styles.formatSelector}>
              <Text style={[styles.formatLabel, { color: colors.text }]}>Формат обучения:</Text>
              <View style={styles.formatOptions}>
                {['online', 'offline', 'both'].map(format => (
                  <TouchableOpacity
                    key={format}
                    style={[
                      styles.formatOption,
                      { borderColor: colors.border },
                      newOffer.learningFormat === format && { 
                        backgroundColor: colors.primary,
                        borderColor: colors.primary 
                      }
                    ]}
                    onPress={() => setNewOffer({ ...newOffer, learningFormat: format })}
                  >
                    <Text style={[
                      styles.formatOptionText,
                      { color: colors.text },
                      newOffer.learningFormat === format && { color: 'white' }
                    ]}>
                      {format === 'online' ? 'Онлайн' : 
                       format === 'offline' ? 'Оффлайн' : 'Оба'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateOffer}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createButtonText}>Создать заявку</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Модалка удаления профиля */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Удаление профиля</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Вы уверены, что хотите удалить профиль? Все ваши данные и заявки будут удалены.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.textTertiary }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: 'white' }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteProfile}
              >
                <Text style={styles.deleteButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeButton: {
    padding: 8,
  },
  deleteProfileButton: {
    padding: 8,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  userId: {
    fontSize: 14,
  },
  skillsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  skillsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offersCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  offerContent: {
    flex: 1,
  },
  offerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  offerItemDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  offerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  offerActionButton: {
    padding: 8,
  },
  editOfferForm: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  form: {
    marginTop: 8,
  },
  formatSelector: {
    marginBottom: 20,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formatOptions: {
    flexDirection: 'row',
  },
  formatOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  formatOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    margin: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen;