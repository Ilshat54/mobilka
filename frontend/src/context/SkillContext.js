import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offersAPI, chatsAPI, messagesAPI, authAPI, skillsAPI } from '../services/api';

const SkillContext = createContext();

export const SkillProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Загрузить пользователя из хранилища при старте
  useEffect(() => {
    loadUser();
    // Загружаем навыки с задержкой, чтобы не блокировать старт приложения
    // и только если backend доступенr
    const timer = setTimeout(() => {
      loadSkills();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Загрузить пользователя
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Загружаем свежий профиль с сервера, чтобы получить актуальные данные
        try {
          const profileResponse = await authAPI.getProfile();
          if (profileResponse && profileResponse.success && profileResponse.user) {
            setUser(profileResponse.user);
            await AsyncStorage.setItem('user', JSON.stringify(profileResponse.user));
          }
        } catch (profileError) {
          console.warn('Failed to load fresh profile, using cached user data:', profileError);
        }
        // Загружаем данные после авторизации
        loadOffers();
        loadChats();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Загрузить навыки
  const loadSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      
      // Обрабатываем разные форматы ответа
      let skillsList = [];
      if (response) {
        if (Array.isArray(response)) {
          skillsList = response;
        } else if (response.results && Array.isArray(response.results)) {
          skillsList = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          skillsList = response.data;
        }
      }
      
      setSkills(skillsList);
    } catch (error) {
      // Тихая ошибка - навыки не критичны для работы приложения
      console.warn('Skills API недоступен. Приложение будет работать без предзагруженных навыков.');
      setSkills([]);
    }
  };

  // Загрузить заявки
  const loadOffers = async (params = {}) => {
    try {
      setLoading(true);
      const response = await offersAPI.getAll(params);

      // DRF может возвращать данные в формате pagination или просто массив
      let offersList = [];
      if (response) {
        if (Array.isArray(response)) {
          offersList = response;
        } else if (response.results && Array.isArray(response.results)) {
          // Формат pagination
          offersList = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          offersList = response.data;
        }
      }

      if (__DEV__) {
        console.log('📋 Loaded offers:', offersList.length, 'offers');
      }

      if (offersList.length > 0) {
        // Преобразуем данные в формат, который ожидает фронтенд
        const formattedOffers = offersList?.map((offer) => {
          // Обработка навыков для изучения
          let skillsToLearnArray = [];
          if (Array.isArray(offer.skills_to_learn) && offer.skills_to_learn.length > 0) {
            skillsToLearnArray = offer.skills_to_learn.map((s) => {
              if (typeof s === 'object' && s !== null) {
                return s.name || s.title || (s.id ? String(s.id) : String(s));
              }
              return typeof s === 'string' ? s : String(s);
            });
          } else if (offer.skillsToLearn && Array.isArray(offer.skillsToLearn)) {
            skillsToLearnArray = offer.skillsToLearn;
          }

          // Обработка навыков для обучения
          let skillsToTeachArray = [];
          if (Array.isArray(offer.skills_to_teach) && offer.skills_to_teach.length > 0) {
            skillsToTeachArray = offer.skills_to_teach.map((s) => {
              if (typeof s === 'object' && s !== null) {
                return s.name || s.title || (s.id ? String(s.id) : String(s));
              }
              return typeof s === 'string' ? s : String(s);
            });
          } else if (offer.skillsToTeach && Array.isArray(offer.skillsToTeach)) {
            skillsToTeachArray = offer.skillsToTeach;
          }

          if (__DEV__) {
            console.log(`📋 Offer ${offer.id}: skills_to_learn=`, offer.skills_to_learn, '->', skillsToLearnArray);
            console.log(`📋 Offer ${offer.id}: skills_to_teach=`, offer.skills_to_teach, '->', skillsToTeachArray);
          }

          return {
            id: offer.id?.toString() || String(offer.id),
            userId: offer.user?.id?.toString() || String(offer.user?.id || ''),
            userName: offer.user?.name || offer.user?.username || offer.user?.full_name || 'Пользователь',
            userAvatar: offer.user?.avatar_seed || offer.user?.username || 'U',
            title: offer.title || '',
            description: offer.description || '',
            skillsToLearn: skillsToLearnArray,
            skillsToTeach: skillsToTeachArray,
            learningFormat: offer.learning_format || offer.learningFormat || 'online',
            location: offer.location || '',
            createdAt: offer.created_at || offer.createdAt || new Date().toISOString(),
          };
        });
        setOffers(formattedOffers);
      } else {
        // Если список пустой, устанавливаем пустой массив
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      // При ошибке устанавливаем пустой массив, чтобы не было undefined
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузить чаты
  const loadChats = async () => {
    try {
      const response = await chatsAPI.getAll();

      // Обработка формата pagination или массива
      let chatsList = [];
      if (response) {
        if (Array.isArray(response)) {
          chatsList = response;
        } else if (response.results && Array.isArray(response.results)) {
          chatsList = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          chatsList = response.data;
        }
      }

      if (chatsList.length > 0) {
        // Преобразуем данные
        const formattedChats = chatsList?.map((chat) => ({
          id: chat.id?.toString() || String(chat.id),
          participantId: chat.other_participant?.id?.toString() || '',
          participantName: chat.other_participant?.name || chat.other_participant?.username || 'Пользователь',
          participantAvatarSeed: chat.other_participant?.avatar_seed || chat.other_participant?.username || '',
          participantAvatar: chat.other_participant?.avatar_seed || chat.other_participant?.username || 'U',
          lastMessage: chat.last_message?.text || '',
          timestamp: chat.last_message?.created_at || chat.updated_at,
          unreadCount: chat.unread_count || 0,
          messages: [], // Загрузим отдельно при открытии чата
        }));
        setChats(formattedChats);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    }
  };

  // Добавить заявку
  const addOffer = async (offerData) => {
    try {
      setLoading(true);

      if (__DEV__) {
        console.log('➕ Creating offer:', offerData.title);
      }

      // Преобразуем навыки в ID если они есть в списке, иначе отправляем названия
      const skillsToLearnArray = Array.isArray(offerData.skillsToLearn) 
        ? offerData.skillsToLearn 
        : (offerData.skillsToLearn || '').split(',').map(s => s.trim()).filter(s => s);
      
      const skillsToTeachArray = Array.isArray(offerData.skillsToTeach) 
        ? offerData.skillsToTeach 
        : (offerData.skillsToTeach || '').split(',').map(s => s.trim()).filter(s => s);

      const skillsToLearnIds = skillsToLearnArray
        ?.map((skillName) => {
          const skill = skills.find((s) => {
            const skillNameLower = (skillName || '').toLowerCase().trim();
            const sNameLower = (s.name || '').toLowerCase().trim();
            return sNameLower === skillNameLower;
          });
          return skill ? skill.id : null;
        })
        .filter((id) => id !== null);

      const skillsToTeachIds = skillsToTeachArray
        ?.map((skillName) => {
          const skill = skills.find((s) => {
            const skillNameLower = (skillName || '').toLowerCase().trim();
            const sNameLower = (s.name || '').toLowerCase().trim();
            return sNameLower === skillNameLower;
          });
          return skill ? skill.id : null;
        })
        .filter((id) => id !== null);

      if (__DEV__) {
        console.log('📝 Skills to learn:', skillsToLearnArray);
        console.log('📝 Skills to teach:', skillsToTeachArray);
        console.log('📝 Skills to learn IDs:', skillsToLearnIds);
        console.log('📝 Skills to teach IDs:', skillsToTeachIds);
      }

      const requestData = {
        title: offerData.title,
        description: offerData.description,
        learning_format: offerData.learningFormat,
        location: offerData.location || '',
      };

      // Если есть ID навыков, отправляем их, иначе отправляем названия для автосоздания
      if (skillsToLearnIds.length > 0) {
        requestData.skills_to_learn_ids = skillsToLearnIds;
      } else if (skillsToLearnArray.length > 0) {
        requestData.skill_names_to_learn = skillsToLearnArray;
      }

      if (skillsToTeachIds.length > 0) {
        requestData.skills_to_teach_ids = skillsToTeachIds;
      } else if (skillsToTeachArray.length > 0) {
        requestData.skill_names_to_teach = skillsToTeachArray;
      }

      const response = await offersAPI.create(requestData);

      if (__DEV__) {
        console.log('✅ Offer created:', response);
      }

      if (response) {
        // Обновляем список заявок после создания
        await loadOffers();
        return response;
      }
    } catch (error) {
      console.error('❌ Error adding offer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Удалить заявку
  const deleteOffer = async (offerId) => {
    try {
      await offersAPI.delete(offerId);
      await loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  };

  // Обновить заявку
  const updateOffer = async (offerId, updatedData) => {
    try {
      setLoading(true);
      
      // Преобразуем навыки если нужно
      const dataToSend = {};
      
      // Копируем простые поля
      if (updatedData.title !== undefined) dataToSend.title = updatedData.title;
      if (updatedData.description !== undefined) dataToSend.description = updatedData.description;
      if (updatedData.learningFormat !== undefined) dataToSend.learning_format = updatedData.learningFormat;
      if (updatedData.location !== undefined) dataToSend.location = updatedData.location;

      // Обработка навыков для изучения
      if (updatedData.skillsToLearn !== undefined) {
        const skillsToLearnArray = Array.isArray(updatedData.skillsToLearn) 
          ? updatedData.skillsToLearn 
          : (typeof updatedData.skillsToLearn === 'string' ? updatedData.skillsToLearn.split(',').map(s => s.trim()).filter(s => s) : []);
        
        const skillsToLearnIds = skillsToLearnArray
          ?.map((skillName) => {
            const skill = skills.find((s) => {
              const skillNameLower = (skillName || '').toLowerCase().trim();
              const sNameLower = (s.name || '').toLowerCase().trim();
              return sNameLower === skillNameLower;
            });
            return skill ? skill.id : null;
          })
          .filter((id) => id !== null);
        
        if (skillsToLearnIds.length > 0) {
          dataToSend.skills_to_learn_ids = skillsToLearnIds;
        } else if (skillsToLearnArray.length > 0) {
          dataToSend.skill_names_to_learn = skillsToLearnArray;
        } else {
          dataToSend.skills_to_learn_ids = [];
        }
      }

      // Обработка навыков для обучения
      if (updatedData.skillsToTeach !== undefined) {
        const skillsToTeachArray = Array.isArray(updatedData.skillsToTeach) 
          ? updatedData.skillsToTeach 
          : (typeof updatedData.skillsToTeach === 'string' ? updatedData.skillsToTeach.split(',').map(s => s.trim()).filter(s => s) : []);
        
        const skillsToTeachIds = skillsToTeachArray
          ?.map((skillName) => {
            const skill = skills.find((s) => {
              const skillNameLower = (skillName || '').toLowerCase().trim();
              const sNameLower = (s.name || '').toLowerCase().trim();
              return sNameLower === skillNameLower;
            });
            return skill ? skill.id : null;
          })
          .filter((id) => id !== null);
        
        if (skillsToTeachIds.length > 0) {
          dataToSend.skills_to_teach_ids = skillsToTeachIds;
        } else if (skillsToTeachArray.length > 0) {
          dataToSend.skill_names_to_teach = skillsToTeachArray;
        } else {
          dataToSend.skills_to_teach_ids = [];
        }
      }

      if (updatedData.learningFormat) {
        dataToSend.learning_format = updatedData.learningFormat;
        delete dataToSend.learningFormat;
      }

      await offersAPI.update(offerId, dataToSend);
      await loadOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Обновить профиль
  const updateProfile = async (userId, updatedData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(updatedData);
      if (response.success && response.user) {
        setUser(response.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        await loadOffers(); // Обновляем заявки, так как имя пользователя могло измениться
      }
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Создать чат
  const createChat = async (participantId, participantName, participantAvatar) => {
    try {
      // Проверяем, есть ли уже чат с этим пользователем
      const existingChat = chats.find((chat) => chat.participantId === participantId.toString());
      if (existingChat) {
        return existingChat.id;
      }

      const response = await chatsAPI.create([parseInt(participantId)]);
      if (response) {
        await loadChats();
        return response.id.toString();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  // Получить чат
  const getChat = async (chatId, forceReload = false) => {
    try {
      let chat = null;
      
      // Всегда загружаем с сервера для актуальных данных
      const response = await chatsAPI.getById(chatId);
      if (response) {
        chat = {
          id: response.id.toString(),
          participantId: response.other_participant?.id?.toString() || '',
          participantName: response.other_participant?.name || response.other_participant?.username || 'Пользователь',
          participantAvatarSeed: response.other_participant?.avatar_seed || response.other_participant?.username || '',
          participantAvatar: response.other_participant?.avatar_seed || response.other_participant?.username || 'U',
          lastMessage: response.last_message?.text || '',
          timestamp: response.last_message?.created_at || response.updated_at,
          unreadCount: response.unread_count || 0,
          messages: [],
        };
      }

      // Всегда загружаем сообщения
      if (chat) {
        const messagesResponse = await chatsAPI.getMessages(chatId);
        if (messagesResponse && messagesResponse.messages && Array.isArray(messagesResponse.messages)) {
          chat.messages = messagesResponse.messages?.map((msg) => ({
            id: msg.id?.toString() || String(msg.id),
            text: msg.text || '',
            senderId: msg.sender?.id?.toString() === user?.id?.toString() ? 'me' : msg.sender?.id?.toString() || '',
            timestamp: msg.created_at || '',
            image: msg.image_url || null,
          }));
        } else if (messagesResponse && Array.isArray(messagesResponse)) {
          // Если ответ - прямой массив сообщений
          chat.messages = messagesResponse.map((msg) => ({
            id: msg.id?.toString() || String(msg.id),
            text: msg.text || '',
            senderId: msg.sender?.id?.toString() === user?.id?.toString() ? 'me' : msg.sender?.id?.toString() || '',
            timestamp: msg.created_at || '',
            image: msg.image_url || null,
          }));
        }
      }

      return chat;
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  };

  // Отправить сообщение
  const sendMessage = async (chatId, text, imageUri = null) => {
    try {
      const response = await messagesAPI.create(chatId, text, imageUri);
      if (response) {
        // Обновляем локальное состояние
        await loadChats();
        // Возвращаем обновленный чат
        return await getChat(chatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Получить мои чаты
  const getMyChats = () => {
    return [...chats].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Удалить чат
  const deleteChat = async (chatId) => {
    try {
      await chatsAPI.delete(chatId);
      // Обновляем список чатов
      await loadChats();
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  // Отметить как прочитанное
  const markAsRead = async (chatId) => {
    try {
      // Обновляем локально
      setChats((prev) => prev.map((chat) => (chat.id === chatId.toString() ? { ...chat, unreadCount: 0 } : chat)));

      // Отмечаем сообщения на сервере (опционально)
      // Можно добавить вызов API для отметки всех сообщений как прочитанных
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Поиск заявок (локальный поиск по уже загруженным)
  const searchOffers = (query) => {
    if (!query.trim()) return offers;

    const searchTerms = query.toLowerCase().trim();
    return offers.filter(
      (offer) =>
        offer.skillsToLearn?.some((skill) => skill.toLowerCase().includes(searchTerms)) ||
        offer.skillsToTeach?.some((skill) => skill.toLowerCase().includes(searchTerms)) ||
        offer.title?.toLowerCase().includes(searchTerms),
    );
  };

  // Установить текущего пользователя (после авторизации)
  const setCurrentUser = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    // Загружаем свежий профиль с сервера после авторизации
    try {
      const profileResponse = await authAPI.getProfile();
      if (profileResponse && profileResponse.success && profileResponse.user) {
        setUser(profileResponse.user);
        await AsyncStorage.setItem('user', JSON.stringify(profileResponse.user));
      }
    } catch (profileError) {
      console.warn('Failed to load fresh profile after login:', profileError);
    }
    await loadOffers();
    await loadChats();
  };

  // Выход
  const logout = async () => {
    await authAPI.signout();
    setUser(null);
    setIsAuthenticated(false);
    setOffers([]);
    setChats([]);
  };

  return (
    <SkillContext.Provider
      value={{
        offers,
        chats,
        user,
        skills,
        loading,
        isAuthenticated,
        addOffer,
        deleteOffer,
        updateOffer,
        addMessage: sendMessage,
        createChat,
        searchOffers,
        getMyChats,
        getChat,
        sendMessage,
        deleteChat,
        markAsRead,
        updateProfile,
        setCurrentUser,
        logout,
        loadOffers,
        loadChats,
      }}
    >
      {children}
    </SkillContext.Provider>
  );
};

export const useSkill = () => {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkill must be used within a SkillProvider');
  }
  return context;
};
