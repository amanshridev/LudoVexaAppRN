import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SpInAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
  StatusUpdateEvent,
} from 'sp-react-native-in-app-updates';

// Initialize SpInAppUpdates instance
const inAppUpdates = new SpInAppUpdates(false);

export const APP_VERSION = '1.2.0';
export const APP_PACKAGE_ID = 'com.LudoVexaApp';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${APP_PACKAGE_ID}`;
export const PLAY_STORE_MARKET_URL = `market://details?id=${APP_PACKAGE_ID}`;

export type UpdateModalState = 'available' | 'downloading' | 'downloaded' | 'up_to_date';

// Structured changelog for what's new and recent updates
export const RECENT_CHANGELOG = [
  {
    icon: '🎨',
    title: 'Modern UI & Clean Board Themes',
    description: 'Fresh minimal styling, vibrant player quadrants, and premium matte board designs.',
    tag: 'Design',
  },
  {
    icon: '⚡',
    title: 'Smarter & Balanced Offline Bot AI',
    description: 'Bots think realistically with competitive tactics, safe tile awareness, and smart token aggression.',
    tag: 'Gameplay',
  },
  {
    icon: '🎁',
    title: 'Watch Ad Rewards & Spin Wheel',
    description: 'Instant +250 free coin rewards with reliable fallback, and free daily bonus spins.',
    tag: 'Rewards',
  },
  {
    icon: '🛡️',
    title: 'Privacy & Profile Controls',
    description: 'Complete transparency over profile visibility, leaderboard status, and device cache management.',
    tag: 'Privacy',
  },
  {
    icon: '🚀',
    title: 'Ultra-Smooth 60 FPS Performance',
    description: 'Optimized dice physics, zero lag animations, and reduced battery consumption.',
    tag: 'Engine',
  },
];

export interface AppUpdateModalProps {
  autoCheck?: boolean;
}

// Global update check handler & listeners so any screen can trigger checks
type UpdateCheckListener = (isManual: boolean) => void;
const listeners = new Set<UpdateCheckListener>();

export const checkAppUpdate = async (isManual: boolean = false): Promise<void> => {
  listeners.forEach((listener) => listener(isManual));
};

export const openPlayStore = async () => {
  try {
    const supported = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
    if (supported) {
      await Linking.openURL(PLAY_STORE_MARKET_URL);
      return;
    }
  } catch (_) { }
  try {
    await Linking.openURL(PLAY_STORE_URL);
  } catch (_) {
    Alert.alert('Google Play Store', 'Unable to open Google Play Store.');
  }
};

export default function AppUpdateModal({ autoCheck = true }: AppUpdateModalProps) {
  const [visible, setVisible] = useState(false);
  const [modalState, setModalState] = useState<UpdateModalState>('available');
  const [storeVersion, setStoreVersion] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadDetails, setDownloadDetails] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Pulse animation for update icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Core update check implementation
  const performCheck = useCallback(async (isManual: boolean = false) => {
    if (Platform.OS !== 'android') {
      if (isManual) {
        setStoreVersion(APP_VERSION);
        setModalState('up_to_date');
        setVisible(true);
      }
      return;
    }

    try {
      const result = await inAppUpdates.checkNeedsUpdate({
        curVersion: APP_VERSION,
        customVersionComparator: () => 1,
      });

      if (result.shouldUpdate) {
        setStoreVersion(result.storeVersion || null);
        setModalState('available');
        setVisible(true);
      } else if (isManual) {
        // Show rich in-app "Up to Date / What's New" modal so the user gets clear visual details
        setStoreVersion(APP_VERSION);
        setModalState('up_to_date');
        setVisible(true);
      }
    } catch (error: any) {
      console.log('[AppUpdateModal] Update check error:', error);
      if (isManual) {
        // Even if Play Store API fails (e.g. debug/sideload), show the rich modal so user sees status & changelog
        setStoreVersion(APP_VERSION);
        setModalState('up_to_date');
        setVisible(true);
      }
    }
  }, []);

  // Listen for manual trigger calls from Settings or other screens
  useEffect(() => {
    const handleListener: UpdateCheckListener = (isManual) => {
      performCheck(isManual);
    };

    listeners.add(handleListener);
    return () => {
      listeners.delete(handleListener);
    };
  }, [performCheck]);

  // Auto-check once on mount if enabled
  useEffect(() => {
    if (autoCheck && Platform.OS === 'android') {
      const timer = setTimeout(() => {
        performCheck(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [autoCheck, performCheck]);

  // Track flexible update download status
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const listener = (status: StatusUpdateEvent) => {
      const { status: installStatus, bytesDownloaded, totalBytesToDownload } = status;

      if (installStatus === IAUInstallStatus.DOWNLOADING) {
        setModalState('downloading');
        if (totalBytesToDownload > 0) {
          const progress = Math.min(
            100,
            Math.max(0, Math.round((bytesDownloaded / totalBytesToDownload) * 100))
          );
          setDownloadProgress(progress);

          const downloadedMb = (bytesDownloaded / (1024 * 1024)).toFixed(1);
          const totalMb = (totalBytesToDownload / (1024 * 1024)).toFixed(1);
          setDownloadDetails(`${downloadedMb} MB / ${totalMb} MB (${progress}%)`);
        }
      } else if (installStatus === IAUInstallStatus.DOWNLOADED) {
        setModalState('downloaded');
        setDownloadProgress(100);
        setVisible(true);
      } else if (installStatus === IAUInstallStatus.FAILED || installStatus === IAUInstallStatus.CANCELED) {
        setIsUpdating(false);
        setModalState('available');
      }
    };

    inAppUpdates.addStatusUpdateListener(listener);
    return () => {
      inAppUpdates.removeStatusUpdateListener(listener);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setIsUpdating(false);
  };

  const handleStartUpdate = async () => {
    setIsUpdating(true);
    try {
      await inAppUpdates.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
      setModalState('downloading');
    } catch (e) {
      console.log('[AppUpdateModal] In-app update failed to launch natively, falling back:', e);
      setIsUpdating(false);
      setVisible(false);
      openPlayStore();
    }
  };

  const handleInstallNow = () => {
    try {
      inAppUpdates.installUpdate();
    } catch (e) {
      console.log('[AppUpdateModal] Failed to install downloaded update:', e);
      openPlayStore();
    }
  };

  if (!visible) return null;

  const isUpToDate = modalState === 'up_to_date';
  const isDownloaded = modalState === 'downloaded';
  const isDownloading = modalState === 'downloading';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Dismiss Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Glowing Animated Icon */}
          <Animated.View
            style={[
              styles.iconWrap,
              isUpToDate && styles.iconWrapSuccess,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.iconEmoji}>
              {isUpToDate ? '✨' : isDownloaded ? '🎉' : isDownloading ? '📥' : '🚀'}
            </Text>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>
            {isUpToDate
              ? 'You’re on the Latest Version!'
              : isDownloaded
                ? 'Update Ready to Install!'
                : isDownloading
                  ? 'Downloading Update...'
                  : 'New Update Available!'}
          </Text>

          {/* Version Pill Badges */}
          <View style={styles.versionRow}>
            <View style={styles.currentVersionBadge}>
              <Text style={styles.versionLabel}>Installed: </Text>
              <Text style={styles.versionValue}>v{APP_VERSION}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {isUpToDate ? '✓ Up to Date' : isDownloaded ? '✓ Ready' : 'Latest Release'}
              </Text>
            </View>
          </View>

          {/* Subtitle / Description */}
          <Text style={styles.description}>
            {isUpToDate
              ? 'Ludo Vexa is running smoothly on the latest build. Here is what has been updated and improved in this release:'
              : isDownloaded
                ? 'The latest update has finished downloading. Restart now to apply new features and optimizations.'
                : isDownloading
                  ? 'Downloading update in background. You can keep rolling dice and playing while it finishes.'
                  : 'A brand new version of Ludo Vexa is live on Google Play with new board styles, enhanced AI, and smoother gameplay.'}
          </Text>

          {/* Scrollable Changelog List (What's New) */}
          <View style={styles.changelogCard}>
            <View style={styles.changelogHeader}>
              <Text style={styles.changelogTitle}>WHAT’S NEW IN THIS VERSION</Text>
              <Text style={styles.changelogSub}>Recent improvements & features</Text>
            </View>

            <ScrollView
              style={styles.changelogScroll}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {RECENT_CHANGELOG.map((item, index) => (
                <View key={index} style={styles.changelogItem}>
                  <View style={styles.changelogIconBox}>
                    <Text style={styles.itemIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeaderRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <View style={styles.itemTag}>
                        <Text style={styles.itemTagText}>{item.tag}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Download Progress Bar (When Downloading) */}
          {isDownloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${downloadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {downloadDetails || `${downloadProgress}% Completed`}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {isUpToDate ? (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleClose}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Great, Keep Playing!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={openPlayStore}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>View Google Play Store Page</Text>
              </TouchableOpacity>
            </View>
          ) : isDownloaded ? (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleInstallNow}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Restart & Install Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.laterBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.laterText}>Install Later</Text>
              </TouchableOpacity>
            </View>
          ) : isDownloading ? (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: '#334155' }]}
                onPress={handleClose}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Continue Playing in Background</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.primaryBtn, isUpdating && { opacity: 0.7 }]}
                onPress={handleStartUpdate}
                disabled={isUpdating}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>
                  {isUpdating ? 'Starting Download...' : 'Update Now (Google Play)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={openPlayStore}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>Open in Google Play Store</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.laterBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.laterText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const ACCENT_COLOR = '#10B981'; // Emerald Green
const BG_CARD = '#0B132B'; // Deep space modern slate

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 24, 0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '90%',
    backgroundColor: BG_CARD,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closeText: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '700',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  iconWrapSuccess: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  currentVersionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  versionLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  versionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  description: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  changelogCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
    marginBottom: 16,
  },
  changelogHeader: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  changelogTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#38BDF8',
  },
  changelogSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  changelogScroll: {
    maxHeight: 180,
  },
  changelogItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  changelogIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemIcon: {
    fontSize: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
    flex: 1,
  },
  itemTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  itemTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  itemDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: ACCENT_COLOR,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6EE7B7',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  laterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  laterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
