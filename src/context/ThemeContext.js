import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { THEME_LIST, buildSemanticTheme } from '../theme/colorThemes';
import { LUDO_THEMES_LIST } from '../theme/colors';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/storage';

const ThemeContext = createContext({
  appTheme: buildSemanticTheme('emerald'),
  appColor: 'emerald',
  ludoTheme: LUDO_THEMES_LIST[3], // galaxy
  ludoThemeId: 'galaxy',
  settings: DEFAULT_SETTINGS,
  setAppColor: () => {},
  setLudoTheme: () => {},
  updateSettings: () => {},
  themesList: THEME_LIST,
  ludoThemesList: LUDO_THEMES_LIST,
  isLoading: true,
});

export function ThemeProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored settings on mount
  useEffect(() => {
    let isMounted = true;
    async function initSettings() {
      try {
        const stored = await loadSettings();
        if (stored && isMounted) {
          setSettingsState(stored);
        }
      } catch (err) {
        console.warn('Failed to load settings in ThemeProvider:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    initSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = useCallback(async (newPartial) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newPartial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const setAppColor = useCallback(async (colorId) => {
    if (!THEME_LIST.some((t) => t.id === colorId)) return;
    updateSettings({ appColor: colorId });
  }, [updateSettings]);

  const setLudoTheme = useCallback(async (themeId) => {
    if (!LUDO_THEMES_LIST.some((t) => t.id === themeId)) return;
    updateSettings({ ludoTheme: themeId });
  }, [updateSettings]);

  const appTheme = useMemo(
    () => buildSemanticTheme(settings.appColor || 'emerald'),
    [settings.appColor]
  );

  const ludoThemeObj = useMemo(
    () =>
      LUDO_THEMES_LIST.find((t) => t.id === settings.ludoTheme) ||
      LUDO_THEMES_LIST[0],
    [settings.ludoTheme]
  );

  const contextValue = useMemo(
    () => ({
      appTheme,
      appColor: settings.appColor || 'emerald',
      ludoTheme: ludoThemeObj,
      ludoThemeId: settings.ludoTheme || 'galaxy',
      settings,
      setAppColor,
      setLudoTheme,
      updateSettings,
      themesList: THEME_LIST,
      ludoThemesList: LUDO_THEMES_LIST,
      isLoading,
    }),
    [
      appTheme,
      settings,
      ludoThemeObj,
      setAppColor,
      setLudoTheme,
      updateSettings,
      isLoading,
    ]
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
