import React, { createContext, useContext, useState } from 'react';

const SkillContext = createContext();

export const SkillProvider = ({ children }) => {
  const [offers, setOffers] = useState([
    {
      id: '1',
      userId: '2',
      userName: 'Анна К.',
      userAvatar: 'AV',
      title: 'Обменяю дизайн на программирование',
      description: 'Ищу партнера для взаимного обучения. Могу научить Figma и UI/UX дизайну, хочу научиться основам JavaScript.',
      skillsToLearn: ['JavaScript', 'React'],
      skillsToTeach: ['Figma', 'UI/UX Design'],
      learningFormat: 'online',
      createdAt: new Date(),
    },
    {
      id: '2',
      userId: '3',
      userName: 'Максим П.',
      userAvatar: 'MP', 
      title: 'Научу программировать, хочу выучить английский',
      description: 'Профессиональный разработчик с опытом 5 лет. Могу помочь с Python и веб-разработкой, сам хочу подтянуть английский для работы.',
      skillsToLearn: ['Английский язык', 'Разговорная практика'],
      skillsToTeach: ['Python', 'Web Development', 'Django'],
      learningFormat: 'both',
      location: 'Москва',
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: '3',
      userId: '4', 
      userName: 'Елена С.',
      userAvatar: 'ES',
      title: 'Ищу ментора по Java',
      description: 'Начинающий разработчик, хочу найти ментора по Java для регулярных консультаций.',
      skillsToLearn: ['Java', 'Spring Framework'],
      skillsToTeach: ['Графический дизайн', 'Photoshop'],
      learningFormat: 'online',
      createdAt: new Date(Date.now() - 172800000),
    },
  ]);

  const [chats, setChats] = useState([
    {
      id: '1',
      participantId: '2',
      participantName: 'Анна К.',
      participantAvatar: '👩‍💼',
      lastMessage: 'Привет! Готова помочь с дизайном',
      timestamp: new Date(Date.now() - 3600000),
      unreadCount: 2,
      messages: [
        {
          id: '1',
          text: 'Привет! Вижу твою заявку по обмену навыками',
          senderId: '2',
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: '2', 
          text: 'Готова помочь с дизайном в обмен на программирование',
          senderId: '2',
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
    },
    {
      id: '2',
      participantId: '3',
      participantName: 'Максим П.',
      participantAvatar: '👨‍💻',
      lastMessage: 'Можем обсудить детали завтра',
      timestamp: new Date(Date.now() - 86400000),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          text: 'Здравствуйте! Заинтересовал ваш опыт в Python',
          senderId: '1',
          timestamp: new Date(Date.now() - 172800000),
        },
        {
          id: '2',
          text: 'Можем обсудить детали завтра',
          senderId: '3', 
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Иван Петров',
      email: 'ivan@example.com',
      avatar: '👤',
      skills: ['React Native', 'TypeScript', 'Дизайн'],
      createdAt: new Date().toISOString(),
    }
  ]);

  const [currentUser, setCurrentUser] = useState({
    id: '1',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    avatar: '👤',
    skills: ['React Native', 'TypeScript', 'Дизайн'],
    createdAt: new Date().toISOString(),
  });

  // Умный поиск с угадыванием
  const searchOffers = (query) => {
    if (!query.trim()) return offers;

    const searchTerms = query.toLowerCase().trim();
    
    // Словарь для транслитерации и синонимов
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    const synonymMap = {
      'js': 'javascript',
      'reactjs': 'react',
      'питон': 'python',
      'пайтон': 'python',
      'джава': 'java',
      'ява': 'java',
      'спринг': 'spring',
      'дизайн': 'figma',
      'ui/ux': 'figma',
      'английский': 'english',
      'английский язык': 'english',
      'программирование': 'programming',
      'кодинг': 'programming',
      'веб': 'web',
      'веб разработка': 'web development',
    };

    // Функция для транслитерации
    const transliterate = (text) => {
      return text.split('').map(char => translitMap[char] || char).join('');
    };

    // Функция для получения синонимов
    const getSynonyms = (term) => {
      return synonymMap[term] ? [term, synonymMap[term]] : [term];
    };

    return offers.filter(offer => {
      const searchableText = `
        ${offer.title.toLowerCase()}
        ${offer.description.toLowerCase()} 
        ${offer.skillsToLearn.join(' ').toLowerCase()}
        ${offer.skillsToTeach.join(' ').toLowerCase()}
        ${offer.learningFormat.toLowerCase()}
        ${offer.location?.toLowerCase() || ''}
      `;

      // Разбиваем запрос на слова
      const queryWords = searchTerms.split(/\s+/);
      
      // Проверяем каждое слово запроса
      return queryWords.some(queryWord => {
        const synonyms = getSynonyms(queryWord);
        const transliterated = transliterate(queryWord);
        
        // Ищем совпадения в разных вариантах
        return synonyms.some(synonym => 
          searchableText.includes(synonym) ||
          searchableText.includes(transliterated) ||
          offer.skillsToLearn.some(skill => 
            skill.toLowerCase().includes(synonym) ||
            skill.toLowerCase().includes(transliterated)
          ) ||
          offer.skillsToTeach.some(skill => 
            skill.toLowerCase().includes(synonym) ||
            skill.toLowerCase().includes(transliterated)
          )
        );
      });
    });
  };

  const addOffer = (offerData) => {
    const newOffer = {
      ...offerData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setOffers(prev => [newOffer, ...prev]);
  };

  const deleteOffer = (offerId) => {
    setOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  const updateOffer = (offerId, updatedData) => {
    setOffers(prev => prev.map(offer =>
      offer.id === offerId ? { ...offer, ...updatedData } : offer
    ));
  };

  const updateProfile = (userId, updatedData) => {
    // Обновляем в массиве users
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updatedData } : user
    ));
    
    // Обновляем текущего пользователя если это он
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
      
      // Обновляем имя в заявках пользователя
      setOffers(prev => prev.map(offer =>
        offer.userId === userId ? { ...offer, userName: updatedData.name } : offer
      ));
    }
  };

  const deleteProfile = (userId) => {
    // Удаляем пользователя из массива
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    // Удаляем заявки пользователя
    setOffers(prev => prev.filter(offer => offer.userId !== userId));
    
    // Удаляем чаты пользователя
    setChats(prev => prev.filter(chat => 
      !chat.participants?.includes(userId) && chat.participantId !== userId
    ));
    
    // Если удаляем текущего пользователя, сбрасываем его
    if (currentUser.id === userId) {
      setCurrentUser(null);
    }
  };

  const addMessage = (chatId, messageData) => {
    const newMessage = {
      ...messageData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage.text,
            timestamp: new Date(),
            unreadCount: messageData.senderId === currentUser.id ? 0 : chat.unreadCount + 1,
          }
        : chat
    ));
  };

  const createChat = (participantId, participantName, participantAvatar) => {
    const existingChat = chats.find(chat => chat.participantId === participantId);
    
    if (existingChat) {
      return existingChat.id;
    }

    const chatId = Math.random().toString(36).substr(2, 9);
    const newChat = {
      id: chatId,
      participantId,
      participantName,
      participantAvatar,
      lastMessage: 'Чат начат',
      timestamp: new Date(),
      unreadCount: 0,
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    return chatId;
  };

  // Получить чаты текущего пользователя
  const getMyChats = () => {
    return chats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Отметить сообщения как прочитанные
  const markAsRead = (chatId) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  };

  return (
    <SkillContext.Provider value={{ 
      offers, 
      chats, 
      user: currentUser, // Используем currentUser вместо user
      users,
      addOffer, 
      deleteOffer,
      updateOffer,
      addMessage, 
      createChat,
      searchOffers,
      getMyChats,
      markAsRead,
      updateProfile,
      deleteProfile,
      setCurrentUser,
    }}>
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