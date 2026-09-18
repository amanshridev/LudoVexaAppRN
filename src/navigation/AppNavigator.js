import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';

// Storage & Utils
import { loadSettings } from '../utils/storage';

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
  const { appTheme, settings, ludoThemeId } = useTheme();
  const [screenStack, setScreenStack] = useState(['splash']);
  const currentScreen = screenStack[screenStack.length - 1];

  // User Global State
  const [user, setUser] = useState({
    name: 'Aman',
    id: '123456',
    coins: 9230,
    avatar: '👨‍💼',
    stats: { played: 48, won: 28, winRate: 58 },
  });

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

  // Hardware back button handler on Android
  useEffect(() => {
    const onBackPress = () => {
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
  }, [screenStack, goBack]);

  const handleGameOver = ({ winner, coinsWon, opponent }) => {
    setGameResult({ winner, coinsWon, opponent });
    if (winner === 'red') {
      setUser((prev) => ({
        ...prev,
        coins: prev.coins + (coinsWon || 200),
        stats: {
          ...prev.stats,
          played: (prev.stats?.played || 48) + 1,
          won: (prev.stats?.won || 28) + 1,
          winRate: Math.round(
            (((prev.stats?.won || 28) + 1) / ((prev.stats?.played || 48) + 1)) * 100
          ),
        },
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          played: (prev.stats?.played || 48) + 1,
          winRate: Math.round(
            ((prev.stats?.won || 28) / ((prev.stats?.played || 48) + 1)) * 100
          ),
        },
      }));
    }
    navigate('gameResult');
  };

  // Render active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={() => reset('welcome')} />;

      case 'welcome':
        return (
          <WelcomeLoginScreen
            onPlayNow={(options) => {
              if (options) setGameOptions(options);
              reset('home');
            }}
            onContinueGuest={(options) => {
              if (options) setGameOptions(options);
              reset('home');
            }}
            onOpenSettings={() => navigate('settings')}
          />
        );

      case 'home':
        return (
          <GameScreen
            key={`${gameOptions.playerCount}_${gameOptions.isVsAi}_${gameOptions.userColor}_${gameOptions.gameMode}_${ludoThemeId}`}
            gameOptions={gameOptions}
            settings={settings}
            isDarkMode={settings.theme === 'dark' || settings.theme === 'neon'}
            onExitHome={() => reset('welcome')}
            onOpenSettings={() => navigate('settings')}
            onGameOver={handleGameOver}
          />
        );

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
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
