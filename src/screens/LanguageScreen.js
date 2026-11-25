import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';

export default function LanguageScreen({ onBack }) {
  const { appTheme, settings, updateSettings } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English', native: 'English (US)' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
    { code: 'hi', flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
    { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
    { code: 'de', flag: '🇩🇪', name: 'German', native: 'Deutsch' },
    { code: 'pt', flag: '🇧🇷', name: 'Portuguese', native: 'Português' },
    { code: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية' },
    { code: 'id', flag: '🇮🇩', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'ru', flag: '🇷🇺', name: 'Russian', native: 'Русский' },
    { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
    { code: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' },
    { code: 'zh', flag: '🇨🇳', name: 'Chinese', native: '中文 (简体)' },
  ];

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCode = settings.language || 'en';

  const handleSelectLanguage = (code) => {
    updateSettings({ language: code });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Language" onBack={onBack} />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search language..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Languages List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.listCard, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            {filteredLanguages.map((lang, index) => {
              const isSelected = selectedCode === lang.code;
              const isLast = index === filteredLanguages.length - 1;

              return (
                <React.Fragment key={lang.code}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectLanguage(lang.code)}
                    style={styles.rowItem}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.flagIcon}>{lang.flag}</Text>
                      <View>
                        <Text style={styles.langName}>{lang.name}</Text>
                        <Text style={[styles.nativeName, { color: appTheme.colors.secondaryText }]}>
                          {lang.native}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: appTheme.colors.primary }]}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {!isLast && <View style={styles.rowDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flagIcon: {
    fontSize: 26,
  },
  langName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  nativeName: {
    fontSize: 12,
    marginTop: 2,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
});
