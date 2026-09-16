import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';

// Storage & Utils
import { loadSettings, saveSettings } from '../utils/storage';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeLoginScreen from '../screens/WelcomeLoginScreen';
import GameScreen from '../screens/GameScreen';

import ThemeScreen from '../screens/ThemeScreen';

export default function AppNavigator() {
  const [screenStack, setScreenStack] = useState(['splash']);
  const currentScreen = screenStack[screenStack.length - 1];

  // User Global State matching screenshot mockup
  const [user, setUser] = useState({
    name: 'Aman',
    id: '123456',
    coins: 9230,
    avatar: '👨‍💼',
    stats: { played: 48, won: 28, winRate: 58 },
  });

  // Settings State
  const [settings, setSettings] = useState({
    theme: 'classic',
    sound: true,
    notifications: true,
    graphics: 'High',
    language: 'English',
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

  // Load saved settings
  useEffect(() => {
    loadSettings().then((saved) => {
      if (saved) setSettings((prev) => ({ ...prev, ...saved }));
    });
  }, []);

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

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

  // Tab navigation from BottomNavBar




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
          />
        );

      case 'home':
        return (
          <GameScreen
            key={`${gameOptions.playerCount}_${gameOptions.isVsAi}_${gameOptions.userColor}_${gameOptions.gameMode}`}
            gameOptions={gameOptions}
            settings={settings}
            isDarkMode={settings.theme === 'dark' || settings.theme === 'neon'}
            onExitHome={() => reset('welcome')}
            onOpenSettings={() => navigate('settings')}
            onGameOver={handleGameOver}
          />
        );




      case 'settings':
      case 'theme':
        return (
          <ThemeScreen
            activeTheme={settings.theme || 'classic'}
            onSelectTheme={(themeId) => {
              handleUpdateSettings({ ...settings, theme: themeId });
            }}
            onBack={goBack}
          />
        );

    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071126',
  },
});
