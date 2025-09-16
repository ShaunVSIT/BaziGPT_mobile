import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Navigation from './src/components/Navigation';
import BackgroundDecorative from './src/components/BackgroundDecorative';
import { COLORS } from './src/constants/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Full screen background OUTSIDE SafeAreaProvider */}
      <BackgroundDecorative />
      <SafeAreaProvider style={{ backgroundColor: 'transparent' }}>
        <Navigation />
      </SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
    </GestureHandlerRootView>
  );
}