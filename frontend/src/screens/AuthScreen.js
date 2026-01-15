import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';

const AuthScreen = ({ navigation, onAuthSuccess }) => {
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    name: '',
    surname: '',
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Валидация
    if (!formData.username.trim()) {
      Alert.alert('Ошибка', 'Введите имя пользователя');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Ошибка', 'Введите пароль');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 8 символов');
      return;
    }

    if (!isLogin) {
      if (formData.password !== formData.password2) {
        Alert.alert('Ошибка', 'Пароли не совпадают');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Вход
        const response = await authAPI.signin(formData.username, formData.password);
        if (response.success) {
          Alert.alert('Успех', 'Вход выполнен успешно');
          if (onAuthSuccess) {
            onAuthSuccess(response.user);
          }
        } else {
          Alert.alert('Ошибка', response.errors?.non_field_errors?.[0] || 'Неверные данные для входа');
        }
      } else {
        // Регистрация
        const response = await authAPI.signup({
          username: formData.username,
          email: formData.email || undefined,
          password: formData.password,
          password2: formData.password2,
          name: formData.name || undefined,
          surname: formData.surname || undefined,
        });

        if (response.success) {
          Alert.alert('Успех', 'Регистрация выполнена успешно');
          if (onAuthSuccess) {
            onAuthSuccess(response.user);
          }
        } else {
          const errorMessage =
            Object.values(response.errors || {})
              .flat()
              .join('\n') || 'Ошибка при регистрации';
          Alert.alert('Ошибка', errorMessage);
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', error.message || 'Произошла ошибка. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{isLogin ? 'Вход' : 'Регистрация'}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Имя пользователя *"
                placeholderTextColor={colors.textTertiary}
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Email *"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Имя (необязательно)"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Фамилия (необязательно)"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.surname}
                    onChangeText={(value) => handleInputChange('surname', value)}
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Пароль * (минимум 8 символов)"
                placeholderTextColor={colors.textTertiary}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Подтвердите пароль *"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.password2}
                  onChangeText={(value) => handleInputChange('password2', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  password2: '',
                  name: '',
                  surname: '',
                });
              }}
            >
              <Text style={[styles.switchButtonText, { color: colors.textSecondary }]}>
                {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
  },
});

export default AuthScreen;
