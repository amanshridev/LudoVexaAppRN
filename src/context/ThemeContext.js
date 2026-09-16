import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_LIST, buildSemanticTheme } from '../theme/colorThemes';

const THEME_STORAGE_KEY = '@VexaLudo_AppTheme_v1';
const DEFAULT_THEME_ID = 'emerald';

const ThemeContext = createContext({
  theme: buildSemanticTheme(DEFAULT_THEME_ID),
  themeId: DEFAULT_THEME_ID,
  setAppTheme: () => {},
  themesList: THEME_LIST,
  isLoading: true,
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored theme on initial app launch
  useEffect(() => {
    let isMounted = true;
    async function loadStoredTheme() {
      try {
        const storedId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedId && isMounted && THEME_LIST.some((t) => t.id === storedId)) {
          setThemeId(storedId);
        }
      } catch (err) {
        console.warn('Failed to load stored app theme:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadStoredTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  // Change theme & persist to local storage immediately
  const setAppTheme = useCallback(async (newThemeId) => {
    if (!THEME_LIST.some((t) => t.id === newThemeId)) return;
    setThemeId(newThemeId);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeId);
    } catch (err) {
      console.warn('Failed to persist app theme:', err);
    }
  }, []);

  const semanticTheme = useMemo(() => buildSemanticTheme(themeId), [themeId]);

  const contextValue = useMemo(
    () => ({
      theme: semanticTheme,
      themeId,
      setAppTheme,
      themesList: THEME_LIST,
      isLoading,
    }),
    [semanticTheme, themeId, setAppTheme, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
