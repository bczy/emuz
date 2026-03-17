import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import type { MainTabParamList } from './types';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PlatformsScreen from '../screens/PlatformsScreen';
import GenresScreen from '../screens/GenresScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import LibraryScreen from '../screens/LibraryScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Bar Icons
interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: string;
  emoji: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, color: _color, emoji }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>
      {emoji}
    </Text>
  </View>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} name="home" emoji="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="Platforms"
        component={PlatformsScreen}
        options={{
          tabBarLabel: 'Platforms',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} name="game" emoji="🎮" />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} name="grid" emoji="📚" />
          ),
        }}
      />
      <Tab.Screen
        name="Genres"
        component={GenresScreen}
        options={{
          tabBarLabel: 'Genres',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} name="tag" emoji="🏷️" />
          ),
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          tabBarLabel: 'Collections',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} name="folder" emoji="📁" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  icon: {
    fontSize: 22,
  },
});
