import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ImpactScreen from '../screens/ImpactScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DiagnosisResultScreen from '../screens/DiagnosisResultScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Scan: { focused: 'scan-circle', unfocused: 'scan-circle-outline' },
  Impact: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  History: { focused: 'time', unfocused: 'time-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

function TabNavigator() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.ashGray,
        tabBarStyle: {
          backgroundColor: COLORS.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t('tabHome') }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ tabBarLabel: t('tabScan') }}
      />
      <Tab.Screen
        name="Impact"
        component={ImpactScreen}
        options={{ tabBarLabel: t('tabImpact') }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: t('tabHistory') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('tabSettings') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="DiagnosisResult" component={DiagnosisResultScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
