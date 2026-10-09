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
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import SoundManager from '../utils/SoundManager';
import { checkAppUpdate, APP_VERSION } from '../components/AppUpdate/AppUpdateModal';

// ============================================================================
// VECTOR SVG ICONS FOR SETTINGS
// ============================================================================

const SpeakerSoundIcon = ({ size = 20, color = '#38BDF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2v6h4l5 4V5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.2}
    />
    <Path
      d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const SpeakerMuteIcon = ({ size = 20, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2v6h4l5 4V5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.15}
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
      fill={color}
      fillOpacity={0.15}
    />
    <Path
      d="M11 18h2M2 9v6M22 9v6M4 6.5v11M20 6.5v11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const BoardPaletteIcon = ({ size = 20, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.12 7.19.78.72 1.88 1.11 2.94.91.73-.14 1.44-.7 1.44-1.55 0-.58-.23-1.12-.55-1.57-.45-.64-.72-1.42-.72-2.28 0-1.93 1.57-3.5 3.5-3.5h1.27c3.31 0 6-2.69 6-6 0-4.42-3.58-8-8-8z"
      stroke={color}
      strokeWidth={2}
      fill={color}
      fillOpacity={0.15}
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
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.2}
    />
    <Path
      d="M19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2L19 16z"
      fill={color}
    />
  </Svg>
);

const BotBrainIcon = ({ size = 20, color = '#EC4899' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="8"
      width="18"
      height="12"
      rx="3"
      stroke={color}
      strokeWidth={2}
      fill={color}
      fillOpacity={0.15}
    />
    <Path
      d="M12 2v6M9 2h6M8 14h.01M16 14h.01M10 17h4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const TargetHintsIcon = ({ size = 20, color = '#06B6D4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={2}
      fill={color}
      fillOpacity={0.15}
    />
    <Path
      d="M12 8v8M8 12h8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="2.5" fill={color} />
  </Svg>
);

const SafeSpotStarIcon = ({ size = 20, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.2}
    />
  </Svg>
);

const ShieldLockIcon = ({ size = 20, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.15}
    />
    <Path
      d="M12 9v4M12 16h.01"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const ShareLinkIcon = ({ size = 20, color = '#38BDF8' }) => (
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

const ExternalWebIcon = ({ size = 18, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = ({ size = 18, color = '#94A3B8' }) => (
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

const AppUpdateArrowIcon = ({ size = 20, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

  const [testFxActive, setTestFxActive] = useState(false);

  // Sound is enabled by default
  const isSoundOn = settings.sound !== false;
  // Haptics is enabled by default
  const isHapticsOn = settings.haptics !== false;
  // AI Difficulty ('easy' | 'medium' | 'hard')
  const aiDifficulty = settings.aiDifficulty || 'medium';
  // Movement hints
  const showHints = settings.showMovementHints !== false;
  // Safe spots
  const showSafeSpots = settings.showSafeSpots !== false;

  // Currently active app color object
  const currentAppColor =
    themesList?.find((t) => t.id === (settings.appColor || appColor || 'slate')) ||
    themesList?.[0] || { name: 'Gunmetal Slate', primary: '#64748B' };

  // Currently active ludo theme object
  const currentLudoTheme =
    ludoTheme ||
    ludoThemesList?.find((t) => t.id === (settings.ludoTheme || ludoThemeId || 'classic')) ||
    ludoThemesList?.[0] || { name: 'Classic Royal', colors: ['#238838', '#DDA715', '#2255A4', '#D92525'] };

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleToggleSound = (val) => {
    try {
      updateSettings({ sound: val });
      SoundManager.setMuted(!val);
      if (val) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(30);
      }
    } catch (_) { }
  };

  const handleToggleHaptics = (val) => {
    try {
      updateSettings({ haptics: val });
      if (val) {
        Vibration.vibrate([0, 40, 30, 40]);
      }
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
    } catch (_) { }
  };

  const handleSelectAiDifficulty = (diff) => {
    try {
      updateSettings({ aiDifficulty: diff });
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(25);
      }
    } catch (_) { }
  };

  const handleToggleHints = (val) => {
    try {
      updateSettings({ showMovementHints: val });
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(25);
      }
    } catch (_) { }
  };

  const handleToggleSafeSpots = (val) => {
    try {
      updateSettings({ showSafeSpots: val });
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(25);
      }
    } catch (_) { }
  };

  const handleTestSound = () => {
    try {
      if (!isSoundOn) {
        updateSettings({ sound: true });
        SoundManager.setMuted(false);
      }
      SoundManager.play('diceRoll');
      if (isHapticsOn) {
        Vibration.vibrate(35);
      }
      setTestFxActive(true);
      setTimeout(() => setTestFxActive(false), 1200);
    } catch (_) { }
  };

  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.LudoVexaApp';

  const handleShareApp = async () => {
    try {
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(30);
      }
      await Share.share({
        title: 'Play Ludo Vexa!',
        message: `🎲 Hey! Let's play Ludo together on Ludo Vexa! Download now on Google Play Store:\n${PLAY_STORE_URL}`,
        url: PLAY_STORE_URL,
      });
    } catch (_) { }
  };

  const handleOpenPlayStore = async () => {
    try {
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(30);
      }
      await Linking.openURL(PLAY_STORE_URL);
    } catch (_) { }
  };

  const handleResetSettings = () => {
    if (isSoundOn) {
      SoundManager.play('buttonTap');
    }
    Alert.alert(
      'Reset All Settings?',
      'This will restore audio, haptics, AI bot level, and board hints to default settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
          style: 'destructive',
          onPress: () => {
            updateSettings({
              sound: true,
              haptics: true,
              aiDifficulty: 'medium',
              showMovementHints: true,
              showSafeSpots: true,
              ludoTheme: 'classic',
              appColor: 'slate',
            });
            SoundManager.setMuted(false);
            SoundManager.play('buttonTap');
            if (isHapticsOn) {
              Vibration.vibrate(50);
            }
          },
        },
      ]
    );
  };

  const themeColors = currentLudoTheme.colors || ['#238838', '#DDA715', '#2255A4', '#D92525'];

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
        {/* 1. HERO PREFERENCES DASHBOARD BANNER */}

        {/* ============================================================== */}
        {/* 2. AUDIO & HAPTIC FEEDBACK SECTION */}
        {/* ============================================================== */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: appTheme.colors.secondaryText }]}>
            AUDIO & FEEDBACK
          </Text>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: appTheme.colors.surface,
                borderColor: 'rgba(255, 255, 255, 0.07)',
              },
            ]}
          >
            {/* SFX SOUND EFFECTS */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                  {isSoundOn ? (
                    <SpeakerSoundIcon size={20} color="#38BDF8" />
                  ) : (
                    <SpeakerMuteIcon size={20} color="#94A3B8" />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>
                      Game Sounds (SFX)
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isSoundOn
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(148, 163, 184, 0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: isSoundOn ? '#10B981' : '#94A3B8' },
                        ]}
                      >
                        {isSoundOn ? 'ON' : 'MUTED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                    Dice rolls, pawn jumps, captures & winner fanfare
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <Switch
                  value={isSoundOn}
                  onValueChange={handleToggleSound}
                  trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* HAPTIC VIBRATION */}
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                  <VibrationIcon size={20} color="#C084FC" />
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.titleBadgeRow}>
                    <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>
                      Haptic Vibration
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isHapticsOn
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(148, 163, 184, 0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: isHapticsOn ? '#C084FC' : '#94A3B8' },
                        ]}
                      >
                        {isHapticsOn ? 'ACTIVE' : 'OFF'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                    Tactile buzz on dice roll, captures & home runs
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <Switch
                  value={isHapticsOn}
                  onValueChange={handleToggleHaptics}
                  trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 3. VISUAL THEMES & APPEARANCE SECTION */}
        {/* ============================================================== */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: appTheme.colors.secondaryText }]}>
            APPEARANCE & THEMES
          </Text>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: appTheme.colors.surface,
                borderColor: 'rgba(255, 255, 255, 0.07)',
              },
            ]}
          >
            {/* LUDO BOARD THEME */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.rowItem}
              onPress={() => onNavigate?.('theme')}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <BoardPaletteIcon size={20} color="#34D399" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>
                    Ludo Board Theme
                  </Text>
                  <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                    {currentLudoTheme.name || 'Classic Board'}
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                {/* 4 Player Mini Color Swatches */}
                <View style={styles.swatchesRow}>
                  {themeColors.slice(0, 4).map((c, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.themeSwatchDot,
                        {
                          backgroundColor: c,
                          marginLeft: idx > 0 ? -4 : 0,
                          zIndex: 4 - idx,
                        },
                      ]}
                    />
                  ))}
                </View>
                <ChevronRightIcon size={18} color={appTheme.colors.primaryLight} />
              </View>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* APP ACCENT COLOR */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.rowItem}
              onPress={() => onNavigate?.('appColor')}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <SparkleIcon size={20} color="#FBBF24" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>
                    App Accent Colors
                  </Text>
                  <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                    {currentAppColor.name || 'Emerald Green'}
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <View
                  style={[
                    styles.accentColorPill,
                    {
                      backgroundColor: currentAppColor.primary || appTheme.colors.primary,
                      shadowColor: currentAppColor.primary || appTheme.colors.primary,
                    },
                  ]}
                />
                <ChevronRightIcon size={18} color={appTheme.colors.primaryLight} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 4. SHARE & COMMUNITY SECTION */}
        {/* ============================================================== */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeaderTitle, { color: appTheme.colors.secondaryText }]}>
            SHARE & COMMUNITY
          </Text>

          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: appTheme.colors.surface,
                borderColor: 'rgba(255, 255, 255, 0.07)',
              },
            ]}
          >
            {/* SHARE APP */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.rowItem}
              onPress={handleShareApp}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                  <ShareLinkIcon size={20} color="#38BDF8" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>
                    Share Ludo Vexa
                  </Text>
                  <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                    Invite friends & family via Google Play Store link
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <View
                  style={[
                    styles.sharePill,
                    {
                      backgroundColor: 'rgba(56, 189, 248, 0.14)',
                      borderColor: 'rgba(56, 189, 248, 0.35)',
                    },
                  ]}
                >
                  <Text style={[styles.sharePillText, { color: '#38BDF8' }]}>Share 🚀</Text>
                </View>
                <ChevronRightIcon size={18} color={appTheme.colors.primaryLight} />
              </View>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* RATE ON PLAY STORE */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.rowItem}
              onPress={handleOpenPlayStore}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(251, 191, 36, 0.12)' }]}>
                  <SafeSpotStarIcon size={20} color="#FBBF24" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>
                    Rate on Google Play
                  </Text>
                  <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                    Love Ludo Vexa? Support us with a 5-star review!
                  </Text>
                </View>
              </View>

              <View style={styles.rowRight}>
                <ExternalWebIcon size={18} color={appTheme.colors.primaryLight} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 5. RESET TO DEFAULTS BUTTON */}
        {/* ============================================================== */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleResetSettings}
          style={[
            styles.resetBtn,
            {
              borderColor: 'rgba(239, 68, 68, 0.35)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            },
          ]}
        >
          <ResetIcon size={18} color="#EF4444" />
          <Text style={styles.resetBtnText}>Restore Default Settings</Text>
        </TouchableOpacity>

        {/* ============================================================== */}
        {/* 7. APP INFO & BUILD FOOTER */}
        {/* ============================================================== */}
        <View style={styles.footerContainer}>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              try {
                SoundManager.play('buttonTap');
              } catch (_) { }
              checkAppUpdate(true);
            }}
          >
            <Text style={[styles.footerBuildText, { color: appTheme.colors.primaryLight }]}>
              Version {APP_VERSION} • Tap to Check for Updates 🔄
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footerCopyrightText, { color: appTheme.colors.mutedText }]}>
            Crafted for Smooth Gaming Experience
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
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 22,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  testSoundBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  testSoundText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Sections
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Row Items
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
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 6,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },

  // Swatches & Indicators
  swatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeSwatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#0F1E36',
  },
  accentColorPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // AI Segmented Control
  botRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // Share Badge Pill
  sharePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 4,
  },
  sharePillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Reset Button
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 22,
  },
  resetBtnText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Footer
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerAppTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  footerBuildText: {
    fontSize: 11,
    marginTop: 3,
  },
  footerCopyrightText: {
    fontSize: 10.5,
    marginTop: 2,
    opacity: 0.7,
  },
});

