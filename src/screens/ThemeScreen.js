import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,

  StatusBar,
  ScrollView,
} from 'react-native';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemeScreen({ onBack, onSelectTheme }) {
  const { appTheme, ludoThemeId, setLudoTheme, ludoThemesList } = useTheme();

  const [selectedThemeId, setSelectedThemeId] = useState(ludoThemeId || 'galaxy');
  const [activeCategory, setActiveCategory] = useState('all');
  const [saveToast, setSaveToast] = useState(null);

  const categories = [
    { id: 'all', label: 'All Themes' },
    { id: 'dark', label: 'Dark Mode' },
    { id: 'light', label: 'Light Mode' },
  ];

  const filteredThemes = ludoThemesList.filter((t) => {
    if (activeCategory === 'dark') return t.dark;
    if (activeCategory === 'light') return !t.dark;
    return true;
  });

  const handleSelectCard = (themeId) => {
    setSelectedThemeId(themeId);
  };

  const handleApplyTheme = async (themeIdToApply) => {
    const targetId = themeIdToApply || selectedThemeId;
    setSelectedThemeId(targetId);
    await setLudoTheme(targetId);
    onSelectTheme?.(targetId);

    setSaveToast('✓ Ludo Board Theme Applied & Saved!');
    setTimeout(() => {
      setSaveToast(null);
    }, 2500);
  };

  const activeThemeObj = ludoThemesList.find((t) => t.id === selectedThemeId) || ludoThemesList[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Ludo Board Theme" onBack={onBack} />

      {/* Info Header Banner */}
      <View style={[styles.infoBanner, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
        <View style={styles.bannerRow}>
          <Text style={styles.bannerIcon}>🎲</Text>
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, { color: appTheme.colors.text }]}>Ludo Board Visual Theme</Text>
            <Text style={[styles.bannerSub, { color: appTheme.colors.secondaryText }]}>
              Customize board tiles, center star graphics, and 4-player quadrant colors.
            </Text>
          </View>
        </View>
      </View>

      {/* Save Success Toast */}
      {saveToast && (
        <View style={[styles.toastContainer, { backgroundColor: appTheme.colors.primary }]}>
          <Text style={styles.toastText}>{saveToast}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: appTheme.colors.surface }]}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.tabBtn,
                isActive && [styles.activeTabBtn, { backgroundColor: appTheme.colors.primary }],
              ]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Theme Cards Grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredThemes.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            const isEquippedInContext = ludoThemeId === theme.id;

            return (
              <TouchableOpacity
                key={theme.id}
                activeOpacity={0.85}
                onPress={() => handleSelectCard(theme.id)}
                style={[
                  styles.themeCard,
                  { backgroundColor: appTheme.colors.surface },
                  isSelected && [styles.themeCardSelected, { borderColor: appTheme.colors.primary }],
                ]}
              >
                {/* Mini Ludo Board Graphic Preview */}
                <View
                  style={[
                    styles.miniBoard,
                    { backgroundColor: theme.boardBg },
                  ]}
                >
                  {/* Top-Left Quadrant */}
                  <View
                    style={[
                      styles.miniQuadrant,
                      styles.topLeft,
                      { backgroundColor: theme.colors[0] },
                    ]}
                  >
                    <View style={styles.miniInnerHole} />
                  </View>

                  {/* Top-Right Quadrant */}
                  <View
                    style={[
                      styles.miniQuadrant,
                      styles.topRight,
                      { backgroundColor: theme.colors[1] },
                    ]}
                  >
                    <View style={styles.miniInnerHole} />
                  </View>

                  {/* Bottom-Left Quadrant */}
                  <View
                    style={[
                      styles.miniQuadrant,
                      styles.bottomLeft,
                      { backgroundColor: theme.colors[3] },
                    ]}
                  >
                    <View style={styles.miniInnerHole} />
                  </View>

                  {/* Bottom-Right Quadrant */}
                  <View
                    style={[
                      styles.miniQuadrant,
                      styles.bottomRight,
                      { backgroundColor: theme.colors[2] },
                    ]}
                  >
                    <View style={styles.miniInnerHole} />
                  </View>

                  {/* Center Star Diamond */}
                  <View style={styles.miniCenter} />
                </View>

                {/* Theme Name with Icon */}
                <View style={styles.nameRow}>
                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                  <Text style={[styles.themeName, { color: appTheme.colors.text }]} numberOfLines={1}>
                    {theme.name}
                  </Text>
                </View>

                {/* Player Color Dots Bar */}
                <View style={styles.dotsBar}>
                  {theme.colors.map((c, idx) => (
                    <View key={idx} style={[styles.dot, { backgroundColor: c }]} />
                  ))}
                </View>

                {/* Quick Equip / Select Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyTheme(theme.id)}
                  style={[
                    styles.equipBtn,
                    isEquippedInContext && [styles.equippedBtn, { backgroundColor: appTheme.colors.primary }],
                  ]}
                >
                  <Text
                    style={[
                      styles.equipBtnText,
                      isEquippedInContext && styles.equippedBtnText,
                    ]}
                  >
                    {isEquippedInContext ? '✓ Active' : isSelected ? 'Apply Now' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Save / Apply Bar */}
      <View style={[styles.bottomSaveBar, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
        <View style={styles.bottomBarTextCol}>
          <Text style={[styles.bottomSelectedLabel, { color: appTheme.colors.secondaryText }]}>SELECTED THEME</Text>
          <Text style={[styles.bottomSelectedValue, { color: appTheme.colors.text }]}>
            {activeThemeObj.icon} {activeThemeObj.name}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleApplyTheme(selectedThemeId)}
          style={[styles.saveApplyBtn, { backgroundColor: appTheme.colors.primary }]}
        >
          <Text style={styles.saveApplyBtnText}>Save & Apply Theme</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  toastContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  themeCardSelected: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  miniBoard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 6,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'space-between',
  },
  miniQuadrant: {
    width: '42%',
    height: '42%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  topLeft: {
    top: 6,
    left: 6,
  },
  topRight: {
    top: 6,
    right: 6,
  },
  bottomLeft: {
    bottom: 6,
    left: 6,
  },
  bottomRight: {
    bottom: 6,
    right: 6,
  },
  miniInnerHole: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  miniCenter: {
    position: 'absolute',
    top: '38%',
    left: '38%',
    width: '24%',
    height: '24%',
    backgroundColor: '#F59E0B',
    transform: [{ rotate: '45deg' }],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  themeIcon: {
    fontSize: 14,
  },
  themeName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  dotsBar: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  equipBtn: {
    width: '100%',
    height: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  equippedBtn: {
    backgroundColor: '#10B981',
  },
  equipBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  equippedBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  bottomSaveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomBarTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  bottomSelectedLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomSelectedValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  saveApplyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  saveApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
