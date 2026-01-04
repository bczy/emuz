import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import GameDetailScreen from '../screens/GameDetailScreen';
import PlatformDetailScreen from '../screens/PlatformDetailScreen';
import GenreDetailScreen from '../screens/GenreDetailScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EmulatorConfigScreen from '../screens/EmulatorConfigScreen';
import ScanProgressScreen from '../screens/ScanProgressScreen';
import SetupScreen from '../screens/SetupScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// EmuZ Dark Theme
const EmuZTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#10B981',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    border: '#334155',
    notification: '#10B981',
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={EmuZTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="GameDetail" 
          component={GameDetailScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="PlatformDetail" 
          component={PlatformDetailScreen}
        />
        <Stack.Screen 
          name="GenreDetail" 
          component={GenreDetailScreen}
        />
        <Stack.Screen 
          name="CollectionDetail" 
          component={CollectionDetailScreen}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="EmulatorConfig" 
          component={EmulatorConfigScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ScanProgress" 
          component={ScanProgressScreen}
          options={{
            animation: 'fade',
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
