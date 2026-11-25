import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalSoundBridge from './src/components/audio/GlobalSoundBridge';
import AppUpdateModal from './src/components/AppUpdate/AppUpdateModal';
import { CrashlyticsService, AdService, NotificationService } from './src/services';

export default function App() {
  useEffect(() => {
    CrashlyticsService.initGlobalHandlers();
    AdService.init();

    // Initialize Push Notifications (FCM token, topics, listeners)
    let unsubscribeForeground: (() => void) | undefined;
    NotificationService.initialize().then(unsub => {
      unsubscribeForeground = unsub;
    });

    return () => {
      if (typeof unsubscribeForeground === 'function') {
        unsubscribeForeground();
      }
    };
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

