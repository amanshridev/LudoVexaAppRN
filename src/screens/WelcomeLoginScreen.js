import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CrownIcon,
  FriendsIcon,
  RobotIcon,
  SettingsGearIcon,
  DiceIcon,
  PawnsGraphic,
  CoinIcon,
} from '../components/ui/AppIcons';
import { useTheme } from '../context/ThemeContext';
import SoundManager from '../utils/SoundManager';
import WinnerOverlay from '../components/WinnerOverlay';

export default function WelcomeLoginScreen({
  onPlayNow,
  onContinueGuest,
  onOpenSettings,
}) {
  const { appTheme, settings } = useTheme();

  // Mode: 'ai' (vs Computer) | 'local' (Pass & Play)
  const [selectedMode, setSelectedMode] = useState('ai');
  // Player Count: 2 | 3 | 4
  const [playerCount, setPlayerCount] = useState(4);
  // User Pawn Color: 'red' | 'green' | 'yellow' | 'blue'
  const [userColor, setUserColor] = useState('red');

  const playerCounts = [2, 3, 4];

  const colors = [
    { id: 'red', name: 'Red', hex: '#EF4444', gradient: ['#F87171', '#B91C1C'] },
    { id: 'green', name: 'Green', hex: '#10B981', gradient: ['#34D399', '#047857'] },
    { id: 'yellow', name: 'Yellow', hex: '#F59E0B', gradient: ['#FDE047', '#B45309'] },
    { id: 'blue', name: 'Blue', hex: '#3B82F6', gradient: ['#60A5FA', '#1D4ED8'] },
  ];

  const playFeedback = () => {
    try {
      if (settings?.sound !== false) {
        SoundManager.play('buttonTap');
      }
      if (settings?.haptics !== false) {
        Vibration.vibrate(20);
      }
    } catch (_) { }
  };

  const handleSelectMode = (modeId) => {
    playFeedback();
    setSelectedMode(modeId);
  };

  const handleSelectCount = (count) => {
    playFeedback();
    setPlayerCount(count);
  };

  const handleSelectColor = (colorId) => {
    playFeedback();
    setUserColor(colorId);
  };

  const handleStartGame = () => {
    try {
      if (settings?.sound !== false) {
        SoundManager.play('diceRoll');
      }
      if (settings?.haptics !== false) {
        Vibration.vibrate(40);
      }
    } catch (_) { }

    const options = {
      playerCount,
      isVsAi: selectedMode === 'ai',
      userColor,
      gameMode: 'classic',
    };
    onPlayNow?.(options);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />

      {/* Top Header: Player profile & Settings */}
      <View style={styles.topBar}>
        <View style={[styles.profilePill, { backgroundColor: appTheme.colors.surface }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View>
            <Text style={[styles.playerName, { color: appTheme.colors.text }]}>Player 1</Text>
            <View style={styles.coinRow}>
              <CoinIcon size={12} />
              <Text style={styles.coinText}>1,000</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            playFeedback();
            onOpenSettings?.();
          }}
          style={[styles.iconButton, { backgroundColor: appTheme.colors.surface }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SettingsGearIcon size={20} color={appTheme.colors.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Title & Pawns Logo */}
        <View style={styles.brandHero}>
          <View style={styles.titleRow}>
            <CrownIcon size={28} />
            <Text style={[styles.brandTitle, { color: appTheme.colors.text }]}>
              Ludo<Text style={{ color: appTheme.colors.primaryLight }}>Game</Text>
            </Text>
          </View>
          <Text style={[styles.brandTagline, { color: appTheme.colors.secondaryText }]}>
            Classic Board Game
          </Text>

          {/* Graphic Banner */}
          <View style={styles.pawnsContainer}>
            <PawnsGraphic size={130} />
          </View>
        </View>

        {/* 1. SELECT GAME MODE (vs Computer or Pass & Play) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            SELECT MODE
          </Text>
          <View style={styles.modeRow}>
            {/* VS Computer */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectMode('ai')}
              style={[
                styles.modeCard,
                { backgroundColor: appTheme.colors.surface },
                selectedMode === 'ai' && [
                  styles.modeCardActive,
                  { borderColor: appTheme.colors.primary, backgroundColor: `${appTheme.colors.primary}20` },
                ],
              ]}
            >
              <View
                style={[
                  styles.modeIconCircle,
                  {
                    backgroundColor: selectedMode === 'ai' ? appTheme.colors.primary : 'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <RobotIcon size={24} color={selectedMode === 'ai' ? '#FFFFFF' : appTheme.colors.primaryLight} />
              </View>
              <Text style={[styles.modeLabel, { color: appTheme.colors.text }]}>vs Computer</Text>
              <Text style={[styles.modeSubText, { color: appTheme.colors.secondaryText }]}>Single Player</Text>
            </TouchableOpacity>

            {/* Pass & Play */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectMode('local')}
              style={[
                styles.modeCard,
                { backgroundColor: appTheme.colors.surface },
                selectedMode === 'local' && [
                  styles.modeCardActive,
                  { borderColor: appTheme.colors.primary, backgroundColor: `${appTheme.colors.primary}20` },
                ],
              ]}
            >
              <View
                style={[
                  styles.modeIconCircle,
                  {
                    backgroundColor: selectedMode === 'local' ? appTheme.colors.primary : 'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <FriendsIcon size={24} color={selectedMode === 'local' ? '#FFFFFF' : appTheme.colors.primaryLight} />
              </View>
              <Text style={[styles.modeLabel, { color: appTheme.colors.text }]}>Pass & Play</Text>
              <Text style={[styles.modeSubText, { color: appTheme.colors.secondaryText }]}>Local Friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. SELECT PLAYERS (2, 3, 4) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            PLAYERS
          </Text>
          <View style={styles.playerCountRow}>
            {playerCounts.map((count) => {
              const active = playerCount === count;
              return (
                <TouchableOpacity
                  key={count}
                  activeOpacity={0.8}
                  onPress={() => handleSelectCount(count)}
                  style={[
                    styles.playerCountBtn,
                    { backgroundColor: appTheme.colors.surface },
                    active && [
                      styles.playerCountBtnActive,
                      {
                        backgroundColor: appTheme.colors.primary,
                        borderColor: appTheme.colors.primaryLight,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.playerCountNumber,
                      { color: active ? '#FFFFFF' : appTheme.colors.text },
                    ]}
                  >
                    {count}
                  </Text>
                  <Text
                    style={[
                      styles.playerCountLabel,
                      { color: active ? 'rgba(255,255,255,0.9)' : appTheme.colors.secondaryText },
                    ]}
                  >
                    Players
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. CHOOSE COLOR (Red, Green, Yellow, Blue) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            CHOOSE YOUR COLOR
          </Text>
          <View style={styles.colorsRow}>
            {colors.map((c) => {
              const active = userColor === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectColor(c.id)}
                  style={[
                    styles.colorItem,
                    { backgroundColor: appTheme.colors.surface },
                    active && {
                      borderColor: c.hex,
                      backgroundColor: `${c.hex}18`,
                    },
                  ]}
                >
                  {/* Glossy Ludo Pawn Token */}
                  <View style={[styles.tokenOuter, { borderColor: `${c.hex}60` }]}>
                    <View style={[styles.tokenInner, { backgroundColor: c.hex }]}>
                      {active && (
                        <View style={styles.tokenCheck}>
                          <Text style={styles.checkChar}>✓</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.colorText,
                      { color: active ? '#FFFFFF' : appTheme.colors.secondaryText },
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Big PLAY NOW Button */}
        <View style={styles.playBtnContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStartGame}
            style={[
              styles.playButton,
              {
                backgroundColor: appTheme.colors.primary,
                shadowColor: appTheme.colors.primary,
              },
            ]}
          >
            <DiceIcon size={26} color="#FFFFFF" />
            <Text style={styles.playButtonText}>PLAY NOW</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  coinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  brandHero: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: 2,
    marginBottom: 8,
  },
  pawnsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeCardActive: {
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modeIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  modeSubText: {
    fontSize: 11,
    fontWeight: '500',
  },
  playerCountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playerCountBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  playerCountBtnActive: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  playerCountNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  playerCountLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorItem: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tokenOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tokenInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tokenCheck: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkChar: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  colorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  playBtnContainer: {
    marginTop: 8,
  },
  playButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

