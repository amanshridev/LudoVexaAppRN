import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
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

export type UpdateModalState = 'available' | 'downloading' | 'downloaded';

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
        Alert.alert(
          'Ludo Vexa Updates',
          'In-app updates via Google Play are only supported on Android devices.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    try {
      // Provide curVersion so it doesn't fail if react-native-device-info native module isn't present
      const result = await inAppUpdates.checkNeedsUpdate({
        curVersion: APP_VERSION,
        customVersionComparator: () => {
          // If Google Play API reports updateAvailability === 2 (AVAILABLE), an update is ready!
          return 1;
        },
      });

      if (result.shouldUpdate) {
        setStoreVersion(result.storeVersion || null);
        setModalState('available');
        setVisible(true);
      } else if (isManual) {
        Alert.alert(
          'Up to Date! 🎉',
          `You are playing on the latest version of Ludo Vexa (v${APP_VERSION}). Enjoy your game!`,
          [{ text: 'Great!' }]
        );
      }
    } catch (error: any) {
      console.log('[AppUpdateModal] Update check error:', error);
      if (isManual) {
        // Frequently happens in sideload/debug builds not installed through Google Play
        Alert.alert(
          'Check for Updates',
          `Current version: v${APP_VERSION}\n\nCould not reach Google Play Store for this build. You can check the official Play Store page directly.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'View on Play Store', onPress: openPlayStore },
          ]
        );
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
      // Slight delay to allow smooth app startup
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
        setVisible(true); // Make sure modal is visible to prompt install
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
      // Flexible update: downloads in background while letting the player continue playing
      await inAppUpdates.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
      // When flexible update starts, switch to downloading state
      setModalState('downloading');
    } catch (e) {
      console.log('[AppUpdateModal] In-app update failed to launch natively, falling back:', e);
      setIsUpdating(false);
      setVisible(false);
      // Fallback: direct to Play Store
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

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={modalState === 'downloading' ? handleClose : handleClose}
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
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.iconEmoji}>
              {modalState === 'downloaded' ? '🎉' : modalState === 'downloading' ? '📥' : '🚀'}
            </Text>
          </Animated.View>

          {/* Title based on state */}
          <Text style={styles.title}>
            {modalState === 'downloaded'
              ? 'Update Ready to Install!'
              : modalState === 'downloading'
                ? 'Downloading Update...'
                : 'New Update Available!'}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {modalState === 'downloaded'
              ? 'The latest update has been downloaded. Restart the app now to enjoy fresh features and smoother gameplay.'
              : modalState === 'downloading'
                ? 'Downloading update in the background. You can continue playing your game while it downloads.'
                : 'A brand new version of Ludo Vexa is available on Google Play with enhanced performance, smarter AI, and improvements.'}
          </Text>

          {/* Version Pill Badges */}
          <View style={styles.versionRow}>

            {!!storeVersion && (
              <>
                <View style={styles.newVersionBadge}>
                  <Text style={styles.versionLabelNew}>Latest: </Text>
                  <Text style={styles.versionValueNew}>v{storeVersion}</Text>
                </View>
              </>
            )}
          </View>

          {/* Download Progress Bar (When Downloading) */}
          {modalState === 'downloading' && (
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
          {modalState === 'downloaded' ? (
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
          ) : modalState === 'downloading' ? (
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
                  {isUpdating ? 'Starting Download...' : 'Update Now'}
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
const ACCENT_GOLD = '#F59E0B'; // Amber Gold
const BG_CARD = '#0F1E36'; // Dark Navy Slate

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 24, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: BG_CARD,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',

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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 38,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  currentVersionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  newVersionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  arrowSeparator: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  versionLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  versionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  versionLabelNew: {
    fontSize: 12,
    color: '#6EE7B7',
  },
  versionValueNew: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: ACCENT_COLOR,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12.5,
    color: '#6EE7B7',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: ACCENT_COLOR,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',

  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryBtnText: {
    color: '#CBD5E1',
    fontSize: 13.5,
    fontWeight: '600',
  },
  laterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  laterText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '600',
  },
});