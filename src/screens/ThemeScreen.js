import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import ScreenHeader from '../components/ui/ScreenHeader';

export default function ThemeScreen({
  activeTheme = 'classic',
  onSelectTheme,
  onBack,
}) {
  const [currentTab, setCurrentTab] = useState('board');
  const [selectedThemeId, setSelectedThemeId] = useState(activeTheme);

  const themes = [
    {
      id: 'classic',
      name: 'Classic Royal',
      icon: '👑',
      colors: ['#238838', '#DDA715', '#2255A4', '#D92525'],
      boardBg: '#FFFFFF',
      dark: false,
    },
    {
      id: 'neon',
      name: 'Neon Cyber',
      icon: '⚡',
      colors: ['#00FFCC', '#FFD700', '#0099FF', '#FF007F'],
      boardBg: '#090D1A',
      dark: true,
    },
    {
      id: 'wood',
      name: 'Wooden Arena',
      icon: '🪵',
      colors: ['#2E7D32', '#F57F17', '#1565C0', '#C62828'],
      boardBg: '#EFEBE9',
      dark: false,
    },
    {
      id: 'galaxy',
      name: 'Galaxy Space',
      icon: '🌌',
      colors: ['#10B981', '#F59E0B', '#6366F1', '#EC4899'],
      boardBg: '#020617',
      dark: true,
    },
    {
      id: 'pastel',
      name: 'Pastel Pop',
      icon: '🍭',
      colors: ['#86EFAC', '#FDE047', '#93C5FD', '#FCA5A5'],
      boardBg: '#FAF5FF',
      dark: false,
    },
    {
      id: 'dark',
      name: 'Dark Night',
      icon: '🌙',
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
      boardBg: '#050B14',
      dark: true,
    },
  ];

  const handleEquip = (theme) => {
    setSelectedThemeId(theme.id);
    onSelectTheme?.(theme.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />
      <ScreenHeader title="Theme" onBack={onBack} />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['board', 'pawns', 'background'].map((tab) => {
          const isActive = currentTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              onPress={() => setCurrentTab(tab)}
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {themes.map((theme) => {
            const isEquipped = selectedThemeId === theme.id;

            return (
              <View
                key={theme.id}
                style={[
                  styles.themeCard,
                  isEquipped && styles.themeCardEquipped,
                ]}
              >
                {/* Mini Board Graphic Thumbnail */}
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

                {/* Theme Title */}
                <Text style={styles.themeName}>{theme.name}</Text>

                {/* Equip Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleEquip(theme)}
                  style={[
                    styles.equipBtn,
                    isEquipped && styles.equippedBtn,
                  ]}
                >
                  <Text
                    style={[
                      styles.equipBtnText,
                      isEquipped && styles.equippedBtnText,
                    ]}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071126',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1D38',
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
    backgroundColor: '#2563EB',
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
    backgroundColor: '#0F1D38',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  themeCardEquipped: {
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
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
  themeName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  equipBtn: {
    width: '100%',
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
});
