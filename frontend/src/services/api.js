import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Получить учетные данные из хранилища
  async getCredentials() {
    try {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');
      if (username && password) {
        return { username, password };
      }
      return null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  }

  // Сохранить учетные данные
  async saveCredentials(username, password) {
    try {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }

  // Удалить учетные данные
  async clearCredentials() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }

  // Создать Basic Auth заголовок
  createBasicAuthHeader(username, password) {
    const credentials = `${username}:${password}`;
    const encoded = btoa(credentials); // base64 encode
    return `Basic ${encoded}`;
  }

  // Базовый метод для запросов
  async request(endpoint, options = {}) {
    const credentials = await this.getCredentials();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(credentials && {
          Authorization: this.createBasicAuthHeader(credentials.username, credentials.password),
        }),
        ...options.headers,
      },
    };

    // Для FormData не устанавливаем Content-Type
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Обработка ошибок
      if (!response.ok) {
        if (response.status === 401) {
          // Не авторизован, очищаем учетные данные
          await this.clearCredentials();
          throw new Error('Unauthorized');
        }

        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Для DELETE и некоторых других запросов может быть пустой ответ (204 No Content)
      if (response.status === 204 || (response.status === 201 && response.headers.get('content-length') === '0')) {
        return { success: true };
      }

      // Проверяем есть ли контент для парсинга
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: true };
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        return { success: true };
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (e) {
        // Если не JSON, возвращаем успех
        return { success: true, message: text };
      }
    } catch (error) {
      // Улучшенная обработка сетевых ошибок
      if (error.message === 'Network request failed' || error.message.includes('Failed to fetch')) {
        const networkError = new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен и доступен.');
        networkError.name = 'NetworkError';
        networkError.originalError = error;
        console.error('API request error (Network):', networkError.message);
        throw networkError;
      }
      console.error('API request error:', error);
      throw error;
    }
  }

  // GET запрос
  async get(endpoint) {
    try {
      return await this.request(endpoint, { method: 'GET' });
    } catch (error) {
      // Пробрасываем ошибку дальше для обработки
      throw error;
    }
  }

  // POST запрос
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запрос
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH запрос
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // POST запрос с FormData (для загрузки файлов)
  async postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

// Создаем экземпляр API сервиса
const apiService = new ApiService();

// API методы для аутентификации
export const authAPI = {
  signup: async (userData) => {
    const response = await apiService.post('/auth/signup/', userData);
    if (response.success && response.user) {
      // Сохраняем учетные данные для Basic Auth
      await apiService.saveCredentials(userData.username, userData.password);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  signin: async (username, password) => {
    const response = await apiService.post('/auth/signin/', { username, password });
    if (response.success && response.user) {
      // Сохраняем учетные данные для Basic Auth
      await apiService.saveCredentials(username, password);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      // Загружаем свежий профиль после входа, чтобы получить актуальные данные
      try {
        const profileResponse = await apiService.get('/auth/profile/');
        if (profileResponse && profileResponse.success && profileResponse.user) {
          await AsyncStorage.setItem('user', JSON.stringify(profileResponse.user));
          // Возвращаем обновленный профиль
          return { ...response, user: profileResponse.user };
        }
      } catch (profileError) {
        console.warn('Failed to load fresh profile after signin:', profileError);
      }
    }
    return response;
  },

  signout: async () => {
    await apiService.clearCredentials();
  },

  getProfile: async () => {
    return apiService.get('/auth/profile/');
  },

  updateProfile: async (userData) => {
    return apiService.put('/auth/profile/', userData);
  },
};

// API методы для заявок
export const offersAPI = {
  getAll: async (params = {}) => {
    return apiService.get('/offers/', params);
  },

  getById: async (id) => {
    return apiService.get(`/offers/${id}/`);
  },

  create: async (offerData) => {
    return apiService.post('/offers/', offerData);
  },

  update: async (id, offerData) => {
    return apiService.put(`/offers/${id}/`, offerData);
  },

  delete: async (id) => {
    return apiService.delete(`/offers/${id}/`);
  },
};

// API методы для чатов
export const chatsAPI = {
  getAll: async () => {
    return apiService.get('/chats/');
  },

  getById: async (id) => {
    return apiService.get(`/chats/${id}/`);
  },

  create: async (participantIds) => {
    return apiService.post('/chats/', { participant_ids: participantIds });
  },

  getMessages: async (chatId) => {
    return apiService.get(`/chats/${chatId}/messages/`);
  },

  delete: async (id) => {
    return apiService.delete(`/chats/${id}/`);
  },
};

// API методы для сообщений
export const messagesAPI = {
  getAll: async (chatId) => {
    return apiService.get('/messages/', { chat_id: chatId });
  },

  create: async (chatId, text, imageUri = null) => {
    if (imageUri) {
      // Создаем FormData для загрузки изображения
      const formData = new FormData();
      formData.append('chat', chatId);
      formData.append('text', text);

      // Добавляем изображение
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      };
      formData.append('image', imageFile);

      return apiService.postFormData('/messages/', formData);
    } else {
      return apiService.post('/messages/', {
        chat: chatId,
        text: text,
      });
    }
  },

  markAsRead: async (messageId) => {
    return apiService.post(`/messages/${messageId}/mark_read/`);
  },
};

// API методы для навыков
export const skillsAPI = {
  getAll: async () => {
    try {
      return await apiService.get('/skills/');
    } catch (error) {
      // Если это сетевая ошибка, возвращаем пустой массив вместо ошибки
      // Это позволяет приложению работать даже если backend недоступен
      if (
        error.name === 'NetworkError' ||
        error.message.includes('Network request failed') ||
        error.message.includes('Failed to fetch')
      ) {
        console.warn('Skills API недоступен, возвращаем пустой массив');
        return [];
      }
      throw error;
    }
  },
};

export default apiService;
