import React from 'react';
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
import { AdService } from '../services';
import { loadUserProfile, saveUserProfile } from '../utils/storage';

// ============================================================================
// CLEAN POLISHED SVG ICONS
// ============================================================================

const SoundIcon = ({ size = 18, color = '#38BDF8' }) => (
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

const MuteIcon = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H2v6h4l5 4V5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 9l-6 6M16 9l6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const VibrationIcon = ({ size = 18, color = '#A855F7' }) => (
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

const BotIcon = ({ size = 18, color = '#EC4899' }) => (
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
      d="M12 3v6M9 3h6M8 14h.01M16 14h.01M9 17h6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const TargetIcon = ({ size = 18, color = '#06B6D4' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <Path d="M12 7v10M7 12h10" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="12" r="2.5" fill={color} />
  </Svg>
);

const StarShieldIcon = ({ size = 18, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.6 5.8 6.4.7-4.8 4.3 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2-4.8-4.3 6.4-.7L12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const LightningIcon = ({ size = 18, color = '#F59E0B' }) => (
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

const PaletteIcon = ({ size = 18, color = '#10B981' }) => (
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

const SparkleIcon = ({ size = 18, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldLockIcon = ({ size = 18, color = '#6366F1' }) => (
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

const ShareLinkIcon = ({ size = 18, color = '#0284C7' }) => (
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

const StarReviewIcon = ({ size = 18, color = '#EAB308' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  </Svg>
);

const AppUpdateIcon = ({ size = 18, color = '#14B8A6' }) => (
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

const ChevronRightIcon = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
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
    } catch (_) { }
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
    } catch (_) { }
  };

  const handleSelectDifficulty = (level) => {
    try {
      updateSettings({ aiDifficulty: level });
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(20);
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
        Vibration.vibrate(20);
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
        Vibration.vibrate(20);
      }
    } catch (_) { }
  };

  const handleToggleTurbo = (val) => {
    try {
      updateSettings({ turboMode: val });
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(20);
      }
    } catch (_) { }
  };

  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.LudoVexaApp';

  const handleShareApp = async () => {
    try {
      if (isSoundOn) {
        SoundManager.play('buttonTap');
      }
      if (isHapticsOn) {
        Vibration.vibrate(25);
      }
      await Share.share({
        title: 'Play Ludo Vexa!',
        message: `🎲 Hey! Let's play Ludo together on Ludo Vexa! Download now on Google Play:\n${PLAY_STORE_URL}`,
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
        Vibration.vibrate(25);
      }
      await Linking.openURL(PLAY_STORE_URL);
    } catch (_) { }
  };

  const handleResetSettings = () => {
    if (isSoundOn) {
      SoundManager.play('buttonTap');
    }
    Alert.alert(
      'Reset Settings',
      'Restore all audio, game rules, and appearance preferences to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
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
            if (isHapticsOn) {
              Vibration.vibrate(40);
            }
          },
        },
      ]
    );
  };

  const difficultyLevels = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  const cardBg = appTheme.colors.surface;
  const primaryColor = appTheme.colors.primary;
  const textColor = appTheme.colors.text;
  const subtextColor = appTheme.colors.secondaryText || '#94A3B8';
  const dividerColor = 'rgba(255, 255, 255, 0.06)';

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
        {/* 1. AUDIO & HAPTICS */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SOUND & VIBRATION</Text>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            {/* Sound FX */}
            <View style={styles.row}>
              <View style={[styles.iconBox, styles.soundIconBg]}>
                {isSoundOn ? (
                  <SoundIcon size={18} color="#38BDF8" />
                ) : (
                  <MuteIcon size={18} color="#64748B" />
                )}
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Sound Effects</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Dice roll, movements & captures
                </Text>
              </View>
              <Switch
                value={isSoundOn}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#1E293B', true: primaryColor }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Haptics */}
            <View style={styles.row}>
              <View style={[styles.iconBox, styles.vibrateIconBg]}>
                <VibrationIcon size={18} color="#C084FC" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Vibration Feedback</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Haptic taps on moves & turns
                </Text>
              </View>
              <Switch
                value={isHapticsOn}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: '#1E293B', true: primaryColor }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 2. GAMEPLAY & BOT SETTINGS */}
        {/* ============================================================== */}

        {/* ============================================================== */}
        {/* 3. APPEARANCE */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APPEARANCE</Text>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            {/* Ludo Board Theme */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={() => {
                try {
                  if (isSoundOn) SoundManager.play('buttonTap');
                  if (isHapticsOn) Vibration.vibrate(20);
                } catch (_) { }
                AdService.showInterstitialAd(() => {
                  onNavigate?.('theme');
                });
              }}
            >
              <View style={[styles.iconBox, styles.paletteIconBg]}>
                <PaletteIcon size={18} color="#34D399" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Board Theme</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  {currentLudoTheme.name || 'Classic'}
                </Text>
              </View>
              <View style={styles.navRight}>
                <View style={styles.themePill}>
                  {themeColors.slice(0, 4).map((c, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.themeColorDot,
                        {
                          backgroundColor: c,
                          zIndex: 4 - idx,
                        },
                        idx > 0 && styles.overlappingDot,
                      ]}
                    />
                  ))}
                </View>
                <ChevronRightIcon size={16} color={subtextColor} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* App Accent Color */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={() => {
                try {
                  if (isSoundOn) SoundManager.play('buttonTap');
                  if (isHapticsOn) Vibration.vibrate(20);
                } catch (_) { }
                AdService.showInterstitialAd(() => {
                  onNavigate?.('appColor');
                });
              }}
            >
              <View style={[styles.iconBox, styles.turboIconBg]}>
                <SparkleIcon size={18} color="#FBBF24" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Accent Color</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  {currentAppColor.name || 'Ocean Blue'}
                </Text>
              </View>
              <View style={styles.navRight}>
                <View
                  style={[
                    styles.accentCircle,
                    {
                      backgroundColor: currentAppColor.primary || primaryColor,
                    },
                  ]}
                />
                <ChevronRightIcon size={16} color={subtextColor} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 4. PRIVACY & MORE */}
        {/* ============================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT & SUPPORT</Text>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            {/* Privacy */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={() => onNavigate?.('privacySettings')}
            >
              <View style={[styles.iconBox, styles.privacyIconBg]}>
                <ShieldLockIcon size={18} color="#818CF8" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Privacy Policy</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Data usage and permissions
                </Text>
              </View>
              <ChevronRightIcon size={16} color={subtextColor} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={handleShareApp}
            >
              <View style={[styles.iconBox, styles.shareIconBg]}>
                <ShareLinkIcon size={18} color="#38BDF8" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Share with Friends</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Invite friends to play Ludo Vexa
                </Text>
              </View>
              <ChevronRightIcon size={16} color={subtextColor} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Rate App */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={handleOpenPlayStore}
            >
              <View style={[styles.iconBox, styles.rateIconBg]}>
                <StarReviewIcon size={18} color="#FACC15" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Rate on Google Play</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Leave a rating & review
                </Text>
              </View>
              <ChevronRightIcon size={16} color={subtextColor} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* App Updates */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={() => {
                try {
                  SoundManager.play('buttonTap');
                } catch (_) { }
                checkAppUpdate(true);
              }}
            >
              <View style={[styles.iconBox, styles.updateIconBg]}>
                <AppUpdateIcon size={18} color="#2DD4BF" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Check for Updates</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Version {APP_VERSION}
                </Text>
              </View>
              <View style={styles.navRight}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>v{APP_VERSION}</Text>
                </View>
                <ChevronRightIcon size={16} color={subtextColor} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Watch Video for Free Reward */}
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.navRow}
              onPress={() => {
                try {
                  SoundManager.play('buttonTap');
                } catch (_) { }

                const rewardCoins = 250;
                AdService.showRewardedAd(
                  async (_reward) => {
                    try {
                      const user = await loadUserProfile();
                      const currentCoins = user?.coins || 0;
                      const newCoins = currentCoins + rewardCoins;
                      await saveUserProfile({ ...user, coins: newCoins });
                      try {
                        SoundManager.play('victory');
                      } catch (_) { }
                      Alert.alert(
                        'Coins Earned! 🎁',
                        `Congratulations! You have received +${rewardCoins} free coins!\nTotal Balance: ${newCoins.toLocaleString()} Coins`,
                        [{ text: 'Awesome!' }]
                      );
                    } catch (e) {
                      Alert.alert('Reward Unlocked! 🎁', `Congratulations! You earned +${rewardCoins} free coins!`);
                    }
                  },
                  () => {
                    console.log('Rewarded Ad finished/closed');
                  },
                  () => {
                    // Ad is not ready / still loading
                    Alert.alert(
                      'Video Ad Loading ⏳',
                      'Ad is currently loading from network. Please wait a few seconds and try again, or check your internet connection.',
                      [{ text: 'OK' }]
                    );
                  }
                );
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                <StarReviewIcon size={18} color="#EAB308" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textColor }]}>Watch Ad & Earn Coins</Text>
                <Text style={[styles.rowSubtitle, { color: subtextColor }]}>
                  Watch video to earn +250 free coins
                </Text>
              </View>
              <View style={styles.navRight}>
                <View style={[styles.badge, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                  <Text style={[styles.badgeText, { color: '#EAB308' }]}>+250 Coins</Text>
                </View>
                <ChevronRightIcon size={16} color={subtextColor} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 5. RESET PREFERENCES */}
        {/* ============================================================== */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleResetSettings}
          style={styles.resetRow}
        >
          <Text style={styles.resetText}>Restore Default Settings</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: subtextColor }]}>
            Ludo Vexa • Version {APP_VERSION}
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
    paddingTop: 16,
    paddingBottom: 36,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 6,
    letterSpacing: 0.6,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  soundIconBg: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  vibrateIconBg: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  botIconBg: {
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  targetIconBg: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  starIconBg: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  turboIconBg: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  paletteIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  privacyIconBg: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  shareIconBg: {
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
  rateIconBg: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  updateIconBg: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  rowSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },

  // AI Difficulty Segment
  difficultyContainer: {
    padding: 14,
  },
  difficultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 9,
    padding: 3,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 7,
  },
  segmentTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 12.5,
    letterSpacing: 0.1,
  },
  textActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInactive: {
    fontWeight: '500',
  },

  // Appearance previews
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  themeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#0F1E36',
  },
  overlappingDot: {
    marginLeft: -4,
  },
  accentCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Version Badge
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Reset
  resetRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  resetText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },

  // Footer
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
