import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Switch,
  Vibration,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import SoundManager from '../utils/SoundManager';
import { checkAppUpdate, APP_VERSION } from '../components/AppUpdate/AppUpdateModal';

// ============================================================================
// PREMIUM VECTOR ICONS
// ============================================================================

const SoundIcon = ({ size = 20, color = '#38BDF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2v6h4l5 4V5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const MuteIcon = ({ size = 20, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2v6h4l5 4V5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 9l-6 6M17 9l6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const VibrationIcon = ({ size = 20, color = '#A855F7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="7"
      y="3"
      width="10"
      height="18"
      rx="3"
      stroke={color}
      strokeWidth={2}
    />
    <Path
      d="M11 18h2M2 9v6M22 9v6M4 6.5v11M20 6.5v11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const BotIcon = ({ size = 20, color = '#EC4899' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="9"
      width="18"
      height="12"
      rx="3"
      stroke={color}
      strokeWidth={2}
    />
    <Path
      d="M12 2v7M9 2h6M8 14h.01M16 14h.01M10 17h4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const TargetIcon = ({ size = 20, color = '#06B6D4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <Path d="M12 7v10M7 12h10" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="12" r="2.5" fill={color} />
  </Svg>
);

const StarShieldIcon = ({ size = 20, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.6 5.8 6.4.7-4.8 4.3 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2-4.8-4.3 6.4-.7L12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const LightningIcon = ({ size = 20, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PaletteIcon = ({ size = 20, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.12 7.19.78.72 1.88 1.11 2.94.91.73-.14 1.44-.7 1.44-1.55 0-.58-.23-1.12-.55-1.57-.45-.64-.72-1.42-.72-2.28 0-1.93 1.57-3.5 3.5-3.5h1.27c3.31 0 6-2.69 6-6 0-4.42-3.58-8-8-8z"
      stroke={color}
      strokeWidth={2}
    />
    <Circle cx="7.5" cy="9.5" r="1.5" fill="#EF4444" />
    <Circle cx="12" cy="6.5" r="1.5" fill="#10B981" />
    <Circle cx="16.5" cy="9.5" r="1.5" fill="#F59E0B" />
  </Svg>
);

const SparkleIcon = ({ size = 20, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldLockIcon = ({ size = 20, color = '#6366F1' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareLinkIcon = ({ size = 20, color = '#0284C7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={2} />
    <Path
      d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);

const StarReviewIcon = ({ size = 20, color = '#EAB308' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const AppUpdateIcon = ({ size = 20, color = '#14B8A6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ResetIcon = ({ size = 18, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 3v5h5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlayFxIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color} />
  </Svg>
);

// ============================================================================
// MAIN COMPONENT: SettingsScreen
// ============================================================================

export default function SettingsScreen({ onNavigate, onBack }) {
  const {
    appTheme,
    ludoTheme,
    ludoThemeId,
    appColor,
    settings,
    updateSettings,
    themesList,
    ludoThemesList,
  } = useTheme();

  const [testFxPlaying, setTestFxPlaying] = useState(false);

  // Sound & Haptics
  const isSoundOn = settings.sound !== false;
  const isHapticsOn = settings.haptics !== false;

  // Gameplay Settings
  const aiDifficulty = settings.aiDifficulty || 'medium';
  const showHints = settings.showMovementHints !== false;
  const showSafeSpots = settings.showSafeSpots !== false;
  const isTurbo = settings.turboMode === true;

  // Active theme details
  const currentAppColor =
    themesList?.find((t) => t.id === (settings.appColor || appColor || 'ocean')) ||
    themesList?.[0] || { name: 'Ocean Blue', primary: '#0284C7' };

  const currentLudoTheme =
    ludoTheme ||
    ludoThemesList?.find((t) => t.id === (settings.ludoTheme || ludoThemeId || 'classic')) ||
    ludoThemesList?.[0] || { name: 'Classic Royal', colors: ['#238838', '#DDA715', '#2255A4', '#D92525'] };

  const themeColors = currentLudoTheme.colors || ['#238838', '#DDA715', '#2255A4', '#D92525'];

  // --------------------------------------------------------------------------
  // ACTIONS & HANDLERS
  // --------------------------------------------------------------------------

  const handleToggleSound = (val) => {
    try {
      updateSettings({ sound: val });
      SoundManager.setMuted(!val);
      if (val) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(20);
      }
    } catch (_) {}
  };

  const handleToggleHaptics = (val) => {
    try {
      updateSettings({ haptics: val });
      if (val) {
        Vibration.vibrate(30);
      }
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
    } catch (_) {}
  };

  const handleSelectDifficulty = (level) => {
    try {
      updateSettings({ aiDifficulty: level });
      if (isSoundOn) SoundManager.play('buttonTap');
      if (isHapticsOn) Vibration.vibrate(20);
    } catch (_) {}
  };

  const handleToggleHints = (val) => {
    try {
      updateSettings({ showMovementHints: val });
      if (isSoundOn) SoundManager.play('buttonTap');
      if (isHapticsOn) Vibration.vibrate(20);
    } catch (_) {}
  };

  const handleToggleSafeSpots = (val) => {
    try {
      updateSettings({ showSafeSpots: val });
      if (isSoundOn) SoundManager.play('buttonTap');
      if (isHapticsOn) Vibration.vibrate(20);
    } catch (_) {}
  };

  const handleToggleTurbo = (val) => {
    try {
      updateSettings({ turboMode: val });
      if (isSoundOn) SoundManager.play('buttonTap');
      if (isHapticsOn) Vibration.vibrate(20);
    } catch (_) {}
  };

  const handleTestAudio = () => {
    try {
      if (!isSoundOn) {
        updateSettings({ sound: true });
        SoundManager.setMuted(false);
      }
      SoundManager.play('diceRoll');
      if (isHapticsOn) {
        Vibration.vibrate([0, 30, 20, 30]);
      }
      setTestFxPlaying(true);
      setTimeout(() => setTestFxPlaying(false), 1200);
    } catch (_) {}
  };

  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.LudoVexaApp';

  const handleShareApp = async () => {
    try {
      if (isSoundOn) SoundManager.play('buttonTap');
      if (isHapticsOn) Vibration.vibrate(25);
      await Share.share({
        title: 'Play Ludo Vexa!',
        message: `🎲 Hey! Let's play Ludo together on Ludo Vexa! Download now on Google Play:\n${PLAY_STORE_URL}`,
        url: PLAY_STORE_URL,
      });
    } catch (_) {}
  };

  const handleOpenPlayStore = async () => {
    try {
      if (isSoundOn) SoundManager.play('buttonTap');
      if (isHapticsOn) Vibration.vibrate(25);
      await Linking.openURL(PLAY_STORE_URL);
    } catch (_) {}
  };

  const handleResetSettings = () => {
    if (isSoundOn) SoundManager.play('buttonTap');
    Alert.alert(
      'Reset All Preferences?',
      'This will restore audio, haptics, AI bot difficulty, hints, board and theme colors to original defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Defaults',
          style: 'destructive',
          onPress: () => {
            updateSettings({
              sound: true,
              haptics: true,
              ludoTheme: 'classic',
              appColor: 'ocean',
              aiDifficulty: 'medium',
              showMovementHints: true,
              showSafeSpots: true,
              turboMode: false,
            });
            SoundManager.setMuted(false);
            if (isHapticsOn) Vibration.vibrate(50);
          },
        },
      ]
    );
  };

  const difficultyLevels = [
    { id: 'easy', label: 'Casual', badgeColor: '#10B981' },
    { id: 'medium', label: 'Balanced', badgeColor: '#F59E0B' },
    { id: 'hard', label: 'Expert', badgeColor: '#EF4444' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Settings" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================== */}
        {/* 1. HERO PREFERENCES DASHBOARD */}
        {/* ============================================================== */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: appTheme.colors.surface,
              borderColor: 'rgba(255, 255, 255, 0.08)',
            },
          ]}
        >
          <View style={styles.heroLeft}>
            <View
              style={[
                styles.heroAvatar,
                { backgroundColor: appTheme.colors.primaryLight + '20' },
              ]}
            >
              <Text style={styles.heroDiceEmoji}>🎲</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroTitle, { color: appTheme.colors.text }]}>
                Game Preferences
              </Text>
              <Text style={[styles.heroSubtitle, { color: appTheme.colors.secondaryText }]}>
                {currentLudoTheme.name} • {currentAppColor.name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTestAudio}
            style={[
              styles.testFxBtn,
              {
                backgroundColor: testFxPlaying
                  ? appTheme.colors.primary
                  : 'rgba(255, 255, 255, 0.08)',
                borderColor: testFxPlaying
                  ? appTheme.colors.primary
                  : 'rgba(255, 255, 255, 0.12)',
              },
            ]}
          >
            <PlayFxIcon size={12} color={testFxPlaying ? '#FFFFFF' : appTheme.colors.text} />
            <Text
              style={[
                styles.testFxText,
                { color: testFxPlaying ? '#FFFFFF' : appTheme.colors.text },
              ]}
            >
              {testFxPlaying ? 'Playing' : 'Test FX'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* 2. AUDIO & HAPTICS SECTION */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.mutedText || '#94A3B8' }]}>
            AUDIO & HAPTICS
          </Text>

          <View style={[styles.card, { backgroundColor: appTheme.colors.surface }]}>
            {/* Sound FX */}
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.14)' }]}>
                {isSoundOn ? (
                  <SoundIcon size={20} color="#38BDF8" />
                ) : (
                  <MuteIcon size={20} color="#94A3B8" />
                )}
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Game Sound FX
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Dice rolls, token moves & captures
                </Text>
              </View>
              <Switch
                value={isSoundOn}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Haptics */}
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.14)' }]}>
                <VibrationIcon size={20} color="#C084FC" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Haptic Feedback
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Vibration pulses during moves & wins
                </Text>
              </View>
              <Switch
                value={isHapticsOn}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 3. GAMEPLAY & BOT INTELLIGENCE */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.mutedText || '#94A3B8' }]}>
            GAMEPLAY & RULES
          </Text>

          <View style={[styles.card, { backgroundColor: appTheme.colors.surface }]}>
            {/* AI Difficulty Selector */}
            <View style={styles.segmentedRow}>
              <View style={styles.segmentHeader}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.14)' }]}>
                  <BotIcon size={20} color="#F472B6" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                    AI Bot Intelligence
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                    Opponent skill in offline & vs Bot matches
                  </Text>
                </View>
              </View>

              <View style={styles.segmentContainer}>
                {difficultyLevels.map((lvl) => {
                  const isActive = aiDifficulty === lvl.id;
                  return (
                    <TouchableOpacity
                      key={lvl.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectDifficulty(lvl.id)}
                      style={[
                        styles.segmentButton,
                        isActive && [
                          styles.segmentButtonActive,
                          { backgroundColor: appTheme.colors.primary },
                        ],
                      ]}
                    >
                      <View
                        style={[
                          styles.segmentIndicatorDot,
                          {
                            backgroundColor: isActive ? '#FFFFFF' : lvl.badgeColor,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.segmentButtonText,
                          {
                            color: isActive ? '#FFFFFF' : appTheme.colors.secondaryText,
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}
                      >
                        {lvl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Movement Hints */}
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(6, 182, 212, 0.14)' }]}>
                <TargetIcon size={20} color="#22D3EE" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Move Destination Hints
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Highlight available board squares on roll
                </Text>
              </View>
              <Switch
                value={showHints}
                onValueChange={handleToggleHints}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Safe Spots Highlight */}
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.14)' }]}>
                <StarShieldIcon size={20} color="#A78BFA" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Star Safe Spots
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Show star markers on protected cells
                </Text>
              </View>
              <Switch
                value={showSafeSpots}
                onValueChange={handleToggleSafeSpots}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Turbo Mode */}
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
                <LightningIcon size={20} color="#FBBF24" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Turbo Animation
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Fast-paced token hops across board
                </Text>
              </View>
              <Switch
                value={isTurbo}
                onValueChange={handleToggleTurbo}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 4. VISUAL THEMES & CUSTOMIZATION */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.mutedText || '#94A3B8' }]}>
            APPEARANCE & THEMES
          </Text>

          <View style={[styles.card, { backgroundColor: appTheme.colors.surface }]}>
            {/* Ludo Board Theme */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => onNavigate?.('theme')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                <PaletteIcon size={20} color="#34D399" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Ludo Board Theme
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  {currentLudoTheme.name || 'Classic Board'}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <View style={styles.swatchesRow}>
                  {themeColors.slice(0, 4).map((c, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.swatchDot,
                        {
                          backgroundColor: c,
                          marginLeft: idx > 0 ? -4 : 0,
                          zIndex: 4 - idx,
                        },
                      ]}
                    />
                  ))}
                </View>
                <ChevronRightIcon size={16} color={appTheme.colors.mutedText || '#64748B'} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* App Accent Color */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => onNavigate?.('appColor')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
                <SparkleIcon size={20} color="#FBBF24" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  App Accent Color
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  {currentAppColor.name || 'Theme Accent'}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <View
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: currentAppColor.primary || appTheme.colors.primary,
                    },
                  ]}
                />
                <ChevronRightIcon size={16} color={appTheme.colors.mutedText || '#64748B'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 5. PRIVACY & ACCOUNT */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.mutedText || '#94A3B8' }]}>
            PRIVACY & SECURITY
          </Text>

          <View style={[styles.card, { backgroundColor: appTheme.colors.surface }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => onNavigate?.('privacySettings')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.14)' }]}>
                <ShieldLockIcon size={20} color="#818CF8" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Privacy & Safety
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Profile visibility, match stats & cache
                </Text>
              </View>
              <View style={styles.rowRight}>
                <ChevronRightIcon size={16} color={appTheme.colors.mutedText || '#64748B'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 6. COMMUNITY & UPDATES */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.mutedText || '#94A3B8' }]}>
            COMMUNITY & SUPPORT
          </Text>

          <View style={[styles.card, { backgroundColor: appTheme.colors.surface }]}>
            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={handleShareApp}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(2, 132, 199, 0.14)' }]}>
                <ShareLinkIcon size={20} color="#38BDF8" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Share Ludo Vexa
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Invite friends & family to play
                </Text>
              </View>
              <View style={styles.rowRight}>
                <ChevronRightIcon size={16} color={appTheme.colors.mutedText || '#64748B'} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Rate on Google Play */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={handleOpenPlayStore}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.14)' }]}>
                <StarReviewIcon size={20} color="#FACC15" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Rate on Google Play
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Support us with a 5-star review
                </Text>
              </View>
              <View style={styles.rowRight}>
                <ChevronRightIcon size={16} color={appTheme.colors.mutedText || '#64748B'} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Check for Updates */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.row}
              onPress={() => {
                try {
                  SoundManager.play('buttonTap');
                } catch (_) {}
                checkAppUpdate(true);
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(20, 184, 166, 0.14)' }]}>
                <AppUpdateIcon size={20} color="#2DD4BF" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>
                  Check for Updates
                </Text>
                <Text style={[styles.rowSubtitle, { color: appTheme.colors.secondaryText }]}>
                  Get the latest boards and features
                </Text>
              </View>
              <View style={styles.rowRight}>
                <View style={styles.versionBadge}>
                  <Text style={[styles.versionBadgeText, { color: appTheme.colors.primaryLight }]}>
                    v{APP_VERSION}
                  </Text>
                </View>
                <ChevronRightIcon size={16} color={appTheme.colors.mutedText || '#64748B'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 7. DANGER ZONE - RESTORE DEFAULTS */}
        {/* ============================================================== */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleResetSettings}
          style={styles.resetButton}
        >
          <ResetIcon size={16} color="#EF4444" />
          <Text style={styles.resetButtonText}>Restore Default Settings</Text>
        </TouchableOpacity>

        {/* ============================================================== */}
        {/* 8. BRANDED FOOTER */}
        {/* ============================================================== */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: appTheme.colors.mutedText || '#64748B' }]}>
            Ludo Vexa Pro Edition • v{APP_VERSION}
          </Text>
          <Text style={[styles.footerSubText, { color: appTheme.colors.mutedText || '#64748B' }]}>
            Designed for Smooth Gaming Experience
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  heroAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroDiceEmoji: {
    fontSize: 22,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  testFxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  testFxText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginBottom: 8,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 62,
  },

  // Segmented AI Control
  segmentedRow: {
    padding: 14,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  segmentButtonText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },

  // Swatches & Indicators
  swatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#0F1E36',
  },
  accentDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Version badge
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Reset button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
    marginTop: 6,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 11.5,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 10.5,
    marginTop: 3,
    opacity: 0.7,
  },
});
