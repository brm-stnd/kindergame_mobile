import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, Gamepad2, Baby, BookOpen, User } from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import GamesScreen from './src/screens/GamesScreen';
import GrowthScreen from './src/screens/GrowthScreen';
import StoriesScreen from './src/screens/StoriesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GameWebViewScreen from './src/screens/GameWebViewScreen';

// Growth sub-screens
import StimulasiScreen from './src/screens/growth/StimulasiScreen';
import GrowthChartScreen from './src/screens/growth/GrowthChartScreen';
import ImunisasiScreen from './src/screens/growth/ImunisasiScreen';
import MPASIScreen from './src/screens/growth/MPASIScreen';

// Native Games
import ShadowMatchGame from './src/games/ShadowMatchGame';

import { AuthProvider } from './src/contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const PRIMARY = '#2DBCAF';

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.98)',
          borderTopColor: '#e2e8f0',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 80,
          paddingTop: 8,
          paddingBottom: 24,
          position: 'absolute',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          const size = 24;
          const strokeWidth = focused ? 2.5 : 1.75;
          
          if (route.name === 'Beranda') {
            return <Home size={size} color={color} strokeWidth={strokeWidth} />;
          } else if (route.name === 'Game') {
            return <Gamepad2 size={size} color={color} strokeWidth={strokeWidth} />;
          } else if (route.name === 'Tumbuh') {
            return <Baby size={size} color={color} strokeWidth={strokeWidth} />;
          } else if (route.name === 'Dongeng') {
            return <BookOpen size={size} color={color} strokeWidth={strokeWidth} />;
          } else if (route.name === 'Profil') {
            return <User size={size} color={color} strokeWidth={strokeWidth} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Game" component={GamesScreen} />
      <Tab.Screen name="Tumbuh" component={GrowthScreen} />
      <Tab.Screen name="Dongeng" component={StoriesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="GameWebView" 
              component={GameWebViewScreen}
              options={{ animation: 'slide_from_right' }}
            />
            {/* Growth sub-screens */}
            <Stack.Screen 
              name="Stimulasi" 
              component={StimulasiScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="GrowthChart" 
              component={GrowthChartScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Imunisasi" 
              component={ImunisasiScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="MPASI" 
              component={MPASIScreen}
              options={{ animation: 'slide_from_right' }}
            />
            {/* Native Games */}
            <Stack.Screen 
              name="ShadowMatch" 
              component={ShadowMatchGame}
              options={{ animation: 'slide_from_right' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
