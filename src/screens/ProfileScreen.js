import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSkill } from '../context/SkillContext';

const ProfileScreen = ({ navigation }) => {
  const { user, offers, addOffer, deleteOffer, updateProfile, deleteProfile } = useSkill();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Заголовок с кнопкой удаления профиля */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
          <TouchableOpacity 
            style={styles.deleteProfileButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>

        {/* Информация пользователя */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <Text style={styles.avatar}>{user.avatar}</Text>
            <View style={styles.userInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={userInfo.name}
                  onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
                  placeholder="Ваше имя"
                />
              ) : (
                <Text style={styles.userName}>{user.name}</Text>
              )}
              <Text style={styles.userId}>ID: {user.id}</Text>
            </View>
          </View>

          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Мои навыки</Text>
            {isEditing ? (
              <TextInput
                style={styles.skillsInput}
                value={userInfo.skills}
                onChangeText={(text) => setUserInfo({ ...userInfo, skills: text })}
                placeholder="Навыки через запятую"
                multiline
              />
            ) : (
              <View style={styles.skillsList}>
                {user.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>💡 {skill}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.editButton}
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
        </View>

        {/* Мои заявки */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои заявки</Text>
            <Text style={styles.offersCount}>{myOffers.length} заявок</Text>
          </View>

          {myOffers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>У вас пока нет заявок</Text>
            </View>
          ) : (
            myOffers.map(offer => (
              <View key={offer.id} style={styles.offerItem}>
                {isEditingOffer === offer.id ? (
                  // Режим редактирования заявки
                  <View style={styles.editOfferForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="Название заявки"
                      value={editingOffer.title}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, title: text })}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Описание"
                      value={editingOffer.description}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, description: text })}
                      multiline
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Навыки для изучения"
                      value={editingOffer.skillsToLearn}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, skillsToLearn: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Навыки для обучения"
                      value={editingOffer.skillsToTeach}
                      onChangeText={(text) => setEditingOffer({ ...editingOffer, skillsToTeach: text })}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={() => handleSaveOffer(offer.id)}
                      >
                        <Text style={styles.saveButtonText}>Сохранить</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelButton}
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
                      <Text style={styles.offerItemTitle}>{offer.title}</Text>
                      <Text style={styles.offerItemDate}>
                        {new Date(offer.createdAt).toLocaleDateString('ru-RU')}
                      </Text>
                      <View style={styles.offerStatus}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Активна</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.offerActions}>
                      <TouchableOpacity 
                        style={styles.offerActionButton}
                        onPress={() => handleEditOffer(offer)}
                      >
                        <Ionicons name="pencil" size={16} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.offerActionButton}
                        onPress={() => handleDeleteOffer(offer.id)}
                      >
                        <Ionicons name="trash" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </View>

        {/* Создание новой заявки */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Создать новую заявку</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Название заявки *"
              value={newOffer.title}
              onChangeText={(text) => setNewOffer({ ...newOffer, title: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Описание *"
              value={newOffer.description}
              onChangeText={(text) => setNewOffer({ ...newOffer, description: text })}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Навыки, которым хочу научиться * (через запятую)"
              value={newOffer.skillsToLearn}
              onChangeText={(text) => setNewOffer({ ...newOffer, skillsToLearn: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Навыки, которым могу научить * (через запятую)"
              value={newOffer.skillsToTeach}
              onChangeText={(text) => setNewOffer({ ...newOffer, skillsToTeach: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Местоположение (необязательно)"
              value={newOffer.location}
              onChangeText={(text) => setNewOffer({ ...newOffer, location: text })}
            />

            <View style={styles.formatSelector}>
              <Text style={styles.formatLabel}>Формат обучения:</Text>
              <View style={styles.formatOptions}>
                {['online', 'offline', 'both'].map(format => (
                  <TouchableOpacity
                    key={format}
                    style={[
                      styles.formatOption,
                      newOffer.learningFormat === format && styles.formatOptionActive
                    ]}
                    onPress={() => setNewOffer({ ...newOffer, learningFormat: format })}
                  >
                    <Text style={[
                      styles.formatOptionText,
                      newOffer.learningFormat === format && styles.formatOptionTextActive
                    ]}>
                      {format === 'online' ? 'Онлайн' : 
                       format === 'offline' ? 'Оффлайн' : 'Оба'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.createButton}
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удаление профиля</Text>
            <Text style={styles.modalText}>
              Вы уверены, что хотите удалить профиль? Все ваши данные и заявки будут удалены.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteProfile}
              >
                <Text style={styles.deleteButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  deleteProfileButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#333',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  skillsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  skillsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
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
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
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
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offersCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  offerContent: {
    flex: 1,
  },
  offerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  offerItemDate: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
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
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
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
    color: '#333',
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
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  formatOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  formatOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  formatOptionTextActive: {
    color: 'white',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
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
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    margin: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
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
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen;