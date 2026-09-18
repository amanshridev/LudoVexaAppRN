import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';

export default function AppColorScreen({ onBack }) {
  const { appTheme, appColor, setAppColor, themesList } = useTheme();
  const [selectedColorId, setSelectedColorId] = useState(appColor || 'emerald');
  const [saveToast, setSaveToast] = useState(null);

  const handleSelectColorCard = (colorId) => {
    setSelectedColorId(colorId);
  };

  const handleApplyColor = async (colorIdToApply) => {
    const targetId = colorIdToApply || selectedColorId;
    setSelectedColorId(targetId);
    await setAppColor(targetId);

    setSaveToast('✓ App Accent Color Saved & Applied!');
    setTimeout(() => {
      setSaveToast(null);
    }, 2500);
  };

  const activeColorObj = themesList.find((t) => t.id === selectedColorId) || themesList[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="App Accent Colors" onBack={onBack} />

      {/* Save Toast Banner */}
      {saveToast && (
        <View style={[styles.toastContainer, { backgroundColor: appTheme.colors.primary }]}>
          <Text style={styles.toastText}>{saveToast}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner / Explanation */}
        <View style={[styles.infoCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={styles.infoTitle}>🎨 Global Application Accent</Text>
          <Text style={[styles.infoDesc, { color: appTheme.colors.secondaryText }]}>
            App Colors customize navigation buttons, active controls, badges, and headers across LudoVexa. Changing the app color does <Text style={{ fontWeight: '800', color: '#FFF' }}>NOT</Text> alter your 4 Ludo game board player colors.
          </Text>
        </View>



        {/* Color Palette Grid */}
        <Text style={[styles.sectionHeading, { color: appTheme.colors.secondaryText }]}>
          SELECT COLOR ACCENT ({themesList.length})
        </Text>

        <View style={styles.grid}>
          {themesList.map((item) => {
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
                  isSelected && [styles.selectedCard, { borderColor: item.primary }],
                ]}
              >
                {/* Large Color Circle */}
                <View style={[styles.circleOuter, { borderColor: item.primary }]}>
                  <View style={[styles.colorCircle, { backgroundColor: item.primary }]} />
                </View>

                {/* Name */}
                <Text style={styles.colorName}>{item.name}</Text>

                {/* Sub-dots for light & dark shades */}
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
                        ? { backgroundColor: item.primary + '50' }
                        : { backgroundColor: 'rgba(255,255,255,0.06)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectPillText,
                      (isAppliedInContext || isSelected) && { color: '#FFFFFF', fontWeight: '900' },
                    ]}
                  >
                    {isAppliedInContext ? '✓ Active' : isSelected ? 'Apply Now' : 'Select'}
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
          <Text style={styles.bottomSelectedLabel}>SELECTED ACCENT</Text>
          <Text style={styles.bottomSelectedValue}>● {activeColorObj.name}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleApplyColor(selectedColorId)}
          style={[styles.saveApplyBtn, { backgroundColor: activeColorObj.primary }]}
        >
          <Text style={styles.saveApplyBtnText}>Save & Apply Color</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  previewBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  previewTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sampleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sampleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sampleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  sampleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  colorCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  selectedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  circleOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  colorCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  colorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  shadeRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 2,
  },
  shadeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    fontSize: 12,
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
