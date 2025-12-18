import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Импорты экранов
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { SkillProvider } from './src/context/SkillContext';
import MessagesScreen from './src/screens/MessagesScreen';
import OfferDetailScreen from './src/screens/OfferDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Главный стек навигации
export default function App() {
  return (
    <SkillProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          {/* Основной экран с табами */}
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          {/* Экран деталей заявки поверх всего */}
          <Stack.Screen 
            name="OfferDetail" 
            component={OfferDetailScreen}
            options={{ 
              title: 'Детали заявки',
              headerBackTitle: 'Назад'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SkillProvider>
  );
}

// Компонент с нижними табами
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Главная') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Сообщения') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Профиль') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Главная" component={HomeScreen} />
      <Tab.Screen name="Сообщения" component={MessagesScreen} />
      <Tab.Screen name="Профиль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}