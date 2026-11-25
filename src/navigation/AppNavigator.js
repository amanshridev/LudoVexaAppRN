import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';

// Storage & Utils
import { loadSettings, loadUserProfile, saveUserProfile, DEFAULT_USER } from '../utils/storage';
import SoundManager from '../utils/SoundManager';
import { AnalyticsService, CrashlyticsService } from '../services';

// Active Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeLoginScreen from '../screens/WelcomeLoginScreen';
import GameScreen from '../screens/GameScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ThemeScreen from '../screens/ThemeScreen';
import AppColorScreen from '../screens/AppColorScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';

// Commented Out Screens (as requested)
// import LanguageScreen from '../screens/LanguageScreen';
// import SoundSettingsScreen from '../screens/SoundSettingsScreen';
// import GameplaySettingsScreen from '../screens/GameplaySettingsScreen';
// import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
// import AboutScreen from '../screens/AboutScreen';

import { useTheme } from '../context/ThemeContext';

export default function AppNavigator() {
  const { appTheme, settings } = useTheme();
  const [screenStack, setScreenStack] = useState(['splash']);
  const currentScreen = screenStack[screenStack.length - 1];
  const isGameMounted = screenStack.includes('home');
  const isGameVisible = currentScreen === 'home';

  // User Global State (Managed locally via AsyncStorage)
  const [user, setUser] = useState(DEFAULT_USER);

  // Load user profile from local storage on launch
  useEffect(() => {
    loadUserProfile().then((profile) => {
      if (profile) setUser(profile);
    });
  }, []);

  const handleUpdateUser = useCallback((updatedProfile) => {
    setUser(updatedProfile);
    saveUserProfile(updatedProfile);
  }, []);

  // Game configuration & results
  const [gameOptions, setGameOptions] = useState({
    gameMode: 'classic',
    playerCount: 4,
    isVsAi: true,
  });

  const [gameResult, setGameResult] = useState({
    winner: 'red',
    coinsWon: 200,
    opponent: 'Player 3',
  });

  // Stack Navigation Methods
  const navigate = useCallback((screenName, params = {}) => {
    setScreenStack((prev) => {
      if (prev[prev.length - 1] === screenName) return prev;
      return [...prev, screenName];
    });
  }, []);

  const goBack = useCallback(() => {
    setScreenStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, prev.length - 1);
    });
  }, []);

  const reset = useCallback((screenName) => {
    setScreenStack([screenName]);
  }, []);

  // Pre-warm SoundManager in background on app launch so games open instantly
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        SoundManager.init();
      } catch (_) {}
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Hardware back button handler on Android
  useEffect(() => {
    const onBackPress = () => {
      if (currentScreen === 'home') {
        Alert.alert(
          'Leave Game',
          'Are you sure you want to quit the current match?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Exit',
              style: 'destructive',
              onPress: () => reset('welcome'),
            },
          ],
          { cancelable: true }
        );
        return true;
      }
      if (screenStack.length > 1) {
        goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [screenStack, currentScreen, goBack, reset]);

  // Log screen views to Firebase Analytics & Crashlytics breadcrumbs
  useEffect(() => {
    if (currentScreen) {
      AnalyticsService.logScreenView(currentScreen);
      CrashlyticsService.log(`Screen view: ${currentScreen}`);
    }
  }, [currentScreen]);

  const handleGameOver = ({ winner, coinsWon, opponent }) => {
    setGameResult({ winner, coinsWon, opponent });
    AnalyticsService.logEvent('game_over', {
      winner,
      coins_won: coinsWon || 0,
      opponent: opponent || 'AI',
    });
    if (winner === 'red') {
      setUser((prev) => {
        const played = (prev.stats?.played || 0) + 1;
        const wonMatches = (prev.stats?.won || 0) + 1;
        const updated = {
          ...prev,
          coins: prev.coins + (coinsWon || 200),
          stats: {
            ...prev.stats,
            played,
            won: wonMatches,
            winRate: Math.round((wonMatches / played) * 100),
          },
        };
        saveUserProfile(updated);
        return updated;
      });
    } else {
      setUser((prev) => {
        const played = (prev.stats?.played || 0) + 1;
        const wonMatches = prev.stats?.won || 0;
        const updated = {
          ...prev,
          stats: {
            ...prev.stats,
            played,
            winRate: Math.round((wonMatches / played) * 100),
          },
        };
        saveUserProfile(updated);
        return updated;
      });
    }
    navigate('gameResult');
  };

  // Render active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onFinish={() => {
              setScreenStack((prev) => (prev[prev.length - 1] === 'splash' ? ['welcome'] : prev));
            }}
          />
        );

      case 'welcome':
        return (
          <WelcomeLoginScreen
            user={user}
            onUpdateUser={handleUpdateUser}
            onPlayNow={(options) => {
              if (options) setGameOptions(options);
              AnalyticsService.logEvent('game_start', {
                mode: options?.gameMode || 'classic',
                players: options?.playerCount || 4,
                type: 'play_now',
              });
              setScreenStack(['welcome', 'home']);
            }}
            onContinueGuest={(options) => {
              if (options) setGameOptions(options);
              AnalyticsService.logEvent('game_start', {
                mode: options?.gameMode || 'classic',
                players: options?.playerCount || 4,
                type: 'guest',
              });
              setScreenStack(['welcome', 'home']);
            }}
            onOpenSettings={() => navigate('settings')}
          />
        );

      case 'home':
        return null;

      case 'settings':
        return <SettingsScreen onNavigate={(route) => navigate(route)} onBack={goBack} />;

      case 'theme':
        return <ThemeScreen onBack={goBack} />;

      case 'appColor':
        return <AppColorScreen onBack={goBack} />;

      case 'privacySettings':
        return <PrivacySettingsScreen onBack={goBack} />;

      default:
        return <SettingsScreen onNavigate={(route) => navigate(route)} onBack={goBack} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      {isGameMounted && (
        <View
          pointerEvents={isGameVisible ? 'auto' : 'none'}
          style={isGameVisible ? styles.screen : styles.hiddenScreen}
        >
          <GameScreen
            key={`${gameOptions.playerCount}_${gameOptions.isVsAi}_${gameOptions.userColor}_${gameOptions.gameMode}`}
            gameOptions={gameOptions}
            settings={settings}
            isDarkMode={settings.theme === 'dark' || settings.theme === 'neon'}
            onExitHome={() => {
              setScreenStack(['welcome']);
            }}
            onOpenSettings={() => navigate('settings')}
            onGameOver={handleGameOver}
          />
        </View>
      )}
      {!isGameVisible && renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  hiddenScreen: {
    display: 'none',
  },
});
