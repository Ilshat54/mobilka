import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

const ThemeContext = createContext();

// Функция для вызова хаптик-отклика
export const triggerHaptic = async () => {
  try {
    if (Platform.OS === 'web') {
      // На веб используем Vibration API если доступен
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else {
      // На мобильных используем expo-haptics

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Medium);
    }
  } catch (error) {
 
    // Игнорируем ошибки если хаптик недоступен
    console.log('Haptic not available');
  }
};

export const ThemeProvider = ({ children }) => {
  // useColorScheme должен вызываться на верхнем уровне без условий
  // На веб может вернуть null, используем fallback
  const colorScheme = useColorScheme();
  const systemColorScheme = colorScheme || 'light';
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'auto'
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const toggleTheme = () => {
    triggerHaptic();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = {
    light: {
      background: '#f8f9fa',
      surface: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#007AFF',
      primaryLight: '#E3F2FD',
      secondary: '#28a745',
      error: '#ff4444',
      border: '#eeeeee',
      shadow: 'rgba(0, 0, 0, 0.04)',
      cardBackground: '#ffffff',
      inputBackground: '#fafafa',
      skillTagLearn: '#E3F2FD',
      skillTagTeach: '#E8F5E8',
      cardShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
    },
    dark: {
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      textTertiary: '#808080',
      primary: '#0A84FF',
      primaryLight: '#1a3a5c',
      secondary: '#34c759',
      error: '#ff453a',
      border: '#333333',
      shadow: '#000000',
      cardBackground: '#1e1e1e',
      inputBackground: '#2a2a2a',
      skillTagLearn: '#1a3a5c',
      skillTagTeach: '#1a3d1a',
    },
  };

  const currentColors = colors[isDark ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark, 
      colors: currentColors, 
      toggleTheme,
      setTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


export default ThemeProvider;