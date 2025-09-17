import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens (we'll create these next)
import SoloReadingScreen from '../screens/SoloReadingScreen';
import DailyScreen from '../screens/DailyScreen';
import CompatibilityScreen from '../screens/CompatibilityScreen';
import FamousScreen from '../screens/FamousScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS, SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'body' : 'body-outline';
          } else if (route.name === 'Daily') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Compatibility') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Famous') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: false, // Hide text labels for cleaner look
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 50 + insets.bottom, // Include safe area in total height
          paddingBottom: 6, // Do not add insets here to avoid large bottom gap
          paddingTop: 4,
          borderTopWidth: 0.5,
        },
        // Ensure no header/border is drawn at the top by the tab navigator
      })}
    >
      <Tab.Screen
        name="Home"
        component={SoloReadingScreen}
        options={{ title: '' }}
      />
      <Tab.Screen
        name="Compatibility"
        component={CompatibilityScreen}
        options={{ title: '' }}
      />
      <Tab.Screen
        name="Daily"
        component={DailyScreen}
        options={{ title: '' }}
      />
      <Tab.Screen
        name="Famous"
        component={FamousScreen}
        options={{ title: '' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '' }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: COLORS.primary,
          background: 'transparent', // Make navigation background transparent
          card: COLORS.surface,
          text: COLORS.text,
          border: COLORS.border,
          notification: COLORS.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerTransparent: true, // Allow content behind header
          gestureEnabled: true,
        }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
