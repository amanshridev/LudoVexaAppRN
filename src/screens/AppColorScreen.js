import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import SoundManager from '../utils/SoundManager';

export default function AppColorScreen({ onBack }) {
  const { appTheme, appColor, setAppColor, themesList } = useTheme();
  const [selectedColorId, setSelectedColorId] = useState(appColor || 'ocean');
  const [activeTab, setActiveTab] = useState('all');
  const [saveToast, setSaveToast] = useState(null);

  const categories = [
    { id: 'all', label: 'All Styles' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'royal', label: 'Royal Gold' },
    { id: 'stealth', label: 'Stealth' },
  ];

  const filteredThemes = themesList.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const handleSelectColorCard = (colorId) => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    setSelectedColorId(colorId);
  };

  const handleApplyColor = async (colorIdToApply) => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    const targetId = colorIdToApply || selectedColorId;
    setSelectedColorId(targetId);
    await setAppColor(targetId);

    setSaveToast('✓ App Accent Color Saved & Applied!');
    setTimeout(() => {
      setSaveToast(null);
      onBack?.();
    }, 700);
  };

  const activeColorObj = themesList.find((t) => t.id === selectedColorId) || themesList[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="App Accent Colors" onBack={onBack} />

      {/* Hero Showcase & Live Preview */}
      <View style={[styles.heroCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextCol}>
            <View style={styles.tagRow}>
              <View style={[styles.activeTag, { backgroundColor: activeColorObj.primary + '25', borderColor: activeColorObj.primary }]}>
                <Text style={[styles.activeTagText, { color: activeColorObj.primaryLight || activeColorObj.primary }]}>
                  {activeColorObj.id === appColor ? 'EQUIPPED ACCENT' : 'PREVIEWING'}
                </Text>
              </View>
              <Text style={[styles.categoryLabel, { color: appTheme.colors.secondaryText }]}>
                Category: {activeColorObj.category?.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: appTheme.colors.text }]}>
              {activeColorObj.name}
            </Text>
          </View>

          {/* Color swatch circle with glow */}
          <View style={[styles.glowRing, { borderColor: activeColorObj.primary, backgroundColor: activeColorObj.primary + '20' }]}>
            <View style={[styles.mainSwatch, { backgroundColor: activeColorObj.primary }]} />
          </View>
        </View>

        {/* Live UI Components Demonstration */}
        <View style={styles.demoBox}>
          <Text style={[styles.demoTitle, { color: appTheme.colors.secondaryText }]}>
            LIVE INTERACTION PREVIEW
          </Text>
          <View style={styles.demoRow}>
            {/* Action button */}
            <View style={[styles.sampleBtn, { backgroundColor: activeColorObj.primary }]}>
              <Text style={[styles.sampleBtnText, { color: activeColorObj.onPrimary || '#FFFFFF' }]}>
                Action Button
              </Text>
            </View>

            {/* Glowing active badge */}
            <View style={[styles.sampleBadge, { borderColor: activeColorObj.primary, backgroundColor: activeColorObj.primary + '25' }]}>
              <Text style={[styles.sampleBadgeText, { color: activeColorObj.primaryLight || activeColorObj.primary }]}>
                ● Active State
              </Text>
            </View>

            {/* Gradient Dot Swatches */}
            <View style={styles.swatchMiniRow}>
              <View style={[styles.swatchMini, { backgroundColor: activeColorObj.primaryLight }]} />
              <View style={[styles.swatchMini, { backgroundColor: activeColorObj.primary }]} />
              <View style={[styles.swatchMini, { backgroundColor: activeColorObj.primaryDark }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Save Toast Banner */}
      {saveToast && (
        <View style={[styles.toastContainer, { backgroundColor: appTheme.colors.primary }]}>
          <Text style={styles.toastText}>{saveToast}</Text>
        </View>
      )}

      {/* Category Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => {
                  try {
                    SoundManager.play('buttonTap');
                  } catch (_) { }
                  setActiveTab(cat.id);
                }}
                style={[
                  styles.tabBtn,
                  isActive && [styles.activeTabBtn, { backgroundColor: appTheme.colors.primary }],
                ]}
              >
                <Text style={[styles.tabBtnText, isActive && styles.activeTabBtnText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredThemes.map((item) => {
            const isSelected = item.id === selectedColorId;
            const isAppliedInContext = item.id === appColor;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleSelectColorCard(item.id)}
                style={[
                  styles.colorCard,
                  { backgroundColor: appTheme.colors.surface },
                  isSelected && [styles.selectedCard, { borderColor: item.primary, backgroundColor: appTheme.colors.surface }],
                ]}
              >
                {/* Active Indicator Badge */}
                {isAppliedInContext && (
                  <View style={[styles.activePillBadge, { backgroundColor: item.primary }]}>
                    <Text style={[styles.activePillBadgeText, { color: item.onPrimary || '#FFFFFF' }]}>IN USE</Text>
                  </View>
                )}

                {/* Color Swatch Circle */}
                <View style={[styles.circleOuter, { borderColor: item.primary, backgroundColor: item.primary + '18' }]}>
                  <View style={[styles.colorCircle, { backgroundColor: item.primary }]} />
                </View>

                {/* Name */}
                <Text style={styles.colorName} numberOfLines={1}>{item.name}</Text>

                {/* Sub-dots for shades */}
                <View style={styles.shadeRow}>
                  <View style={[styles.shadeDot, { backgroundColor: item.primaryLight }]} />
                  <View style={[styles.shadeDot, { backgroundColor: item.primary }]} />
                  <View style={[styles.shadeDot, { backgroundColor: item.primaryDark }]} />
                </View>

                {/* Selection / Apply Pill */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyColor(item.id)}
                  style={[
                    styles.selectPill,
                    isAppliedInContext
                      ? { backgroundColor: item.primary }
                      : isSelected
                        ? { backgroundColor: item.primary + '30', borderWidth: 1, borderColor: item.primary }
                        : { backgroundColor: 'rgba(255,255,255,0.06)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectPillText,
                      isAppliedInContext
                        ? { color: item.onPrimary || '#FFFFFF', fontWeight: '900' }
                        : isSelected
                          ? { color: item.primaryLight || item.primary, fontWeight: '800' }
                          : {},
                    ]}
                  >
                    {isAppliedInContext ? '✓ Active' : isSelected ? 'Apply Accent' : 'Select'}
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
          <Text style={[styles.bottomSelectedLabel, { color: appTheme.colors.secondaryText }]}>SELECTED ACCENT</Text>
          <Text style={[styles.bottomSelectedValue, { color: appTheme.colors.text }]}>
            ● {activeColorObj.name}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleApplyColor(selectedColorId)}
          style={[styles.saveApplyBtn, { backgroundColor: activeColorObj.primary }]}
        >
          <Text style={[styles.saveApplyBtnText, { color: activeColorObj.onPrimary || '#FFFFFF' }]}>
            Apply Accent Color
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  glowRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  demoBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sampleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sampleBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sampleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  sampleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  swatchMiniRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatchMini: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  toastContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginTop: 4,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTabBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeTabBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    justifyContent: 'space-between',
  },
  colorCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  selectedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  activePillBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  activePillBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  circleOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    marginTop: 4,
  },
  colorCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  colorName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  shadeRow: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 2,
  },
  shadeDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  selectPill: {
    width: '100%',
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  selectPillText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomSelectedValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  saveApplyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  saveApplyBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
  },
});
