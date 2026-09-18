import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalSoundBridge from './src/components/audio/GlobalSoundBridge';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle="light-content" backgroundColor="#071126" />
        <AppNavigator />
        <GlobalSoundBridge />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
