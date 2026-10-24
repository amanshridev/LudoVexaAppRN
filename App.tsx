import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalSoundBridge from './src/components/audio/GlobalSoundBridge';
import AppUpdateModal from './src/components/AppUpdate/AppUpdateModal';
import { CrashlyticsService } from './src/services';

export default function App() {
  useEffect(() => {
    CrashlyticsService.initGlobalHandlers();
  }, []);
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle="light-content" backgroundColor="#071126" />
        <AppNavigator />
        <AppUpdateModal />
        <GlobalSoundBridge />
      </ThemeProvider>
    </SafeAreaProvider>

  );
}

