import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import SoundManager from '../../utils/SoundManager';
import { AdService } from '../../services';
import { CoinIcon } from '../ui/AppIcons';
import { loadSpinData, saveSpinData } from '../../utils/storage';

const PRIZES = [
  { id: 1, label: '100', amount: 100, color: '#3B82F6', text: '#FFFFFF' },
  { id: 2, label: '500', amount: 500, color: '#10B981', text: '#FFFFFF' },
  { id: 3, label: '250', amount: 250, color: '#F59E0B', text: '#FFFFFF' },
  { id: 4, label: '1000', amount: 1000, color: '#EC4899', text: '#FFFFFF' },
  { id: 5, label: '150', amount: 150, color: '#8B5CF6', text: '#FFFFFF' },
  { id: 6, label: '750', amount: 750, color: '#06B6D4', text: '#FFFFFF' },
  { id: 7, label: '300', amount: 300, color: '#EAB308', text: '#FFFFFF' },
  { id: 8, label: '2000', amount: 2000, color: '#EF4444', text: '#FFFFFF' },
];

export default function LuckySpinModal({
  visible,
  onClose,
  onRewardCoins,
  userCoins = 1000,
  theme,
}) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotationRef = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [canFreeSpin, setCanFreeSpin] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Check today's spin availability locally
  useEffect(() => {
    if (visible) {
      setWonPrize(null);
      setStatusMessage(null);
      setIsLoadingAd(false);
      loadSpinData().then((data) => {
        const today = new Date().toDateString();
        setCanFreeSpin(data?.lastFreeSpinDate !== today);
      });
      // Pre-load rewarded ad so button works instantly
      try {
        AdService.loadRewardedAd();
      } catch (_) {}
    }
  }, [visible]);

  const handleSpin = (isAdSpin = false) => {
    if (isSpinning) return;

    try {
      SoundManager.play('diceRoll');
      Vibration.vibrate(30);
    } catch (_) {}

    setIsSpinning(true);
    setWonPrize(null);
    setStatusMessage(null);

    // Pick random index 0..7
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const selected = PRIZES[prizeIndex];

    const segmentAngle = 360 / PRIZES.length; // 45 deg
    const targetAngle =
      currentRotationRef.current +
      1800 +
      (360 - (prizeIndex * segmentAngle + segmentAngle / 2));

    Animated.timing(spinAnim, {
      toValue: targetAngle,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      currentRotationRef.current = targetAngle % 360;
      setIsSpinning(false);
      setWonPrize(selected);

      // Award coins locally to user wallet
      onRewardCoins?.(selected.amount);

      // Save spin date if it was free spin
      if (!isAdSpin) {
        const today = new Date().toDateString();
        saveSpinData({ lastFreeSpinDate: today });
        setCanFreeSpin(false);
      }

      try {
        SoundManager.play('victorySound');
        Vibration.vibrate(50);
      } catch (_) {}
    });
  };

  const handleWatchAdSpin = () => {
    if (isSpinning || isLoadingAd) return;

    try {
      SoundManager.play('buttonTap');
    } catch (_) {}

    setIsLoadingAd(true);
    setStatusMessage('Loading video ad...');

    let rewarded = false;

    // Show Rewarded Ad to earn extra spin
    AdService.showRewardedAd(
      () => {
        rewarded = true;
        setIsLoadingAd(false);
        setStatusMessage('🎬 Ad Completed! Spinning Wheel now...');
        setTimeout(() => handleSpin(true), 400);
      },
      () => {
        setIsLoadingAd(false);
        // If ad wasn't loaded or couldn't display, give fallback chance gracefully
        if (!rewarded) {
          if (!AdService.isRewardedReady()) {
            setStatusMessage('🎁 Ad loading in background, extra spin granted!');
            setTimeout(() => handleSpin(true), 600);
          } else {
            setStatusMessage('Ad closed before completion. Watch full ad to spin!');
          }
        }
      }
    );
  };

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const surface = theme?.colors?.surface || '#0F1E36';
  const primary = theme?.colors?.primary || '#2563EB';
  const textColor = theme?.colors?.text || '#FFFFFF';
  const subtextColor = theme?.colors?.secondaryText || '#94A3B8';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: textColor }]}>🎡 Lucky Fortune Spin</Text>
              <Text style={[styles.subtitle, { color: subtextColor }]}>Spin & Win Free Coins!</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSpinning || isLoadingAd}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User Wallet Info Pill in Modal */}
          <View style={styles.walletPill}>
            <CoinIcon size={14} />
            <Text style={styles.walletLabel}>Your Balance: </Text>
            <Text style={styles.walletCoins}>{(userCoins || 1000).toLocaleString()} Coins</Text>
          </View>

          {/* Wheel Stage */}
          <View style={styles.wheelStage}>
            {/* Top Indicator Arrow */}
            <View style={styles.arrowPointer}>
              <Text style={styles.arrowPointerText}>▼</Text>
            </View>

            {/* Rotating Wheel Container */}
            <Animated.View
              style={[
                styles.wheelContainer,
                { transform: [{ rotate: spinInterpolation }] },
              ]}
            >
              {PRIZES.map((prize, idx) => {
                const angle = (idx * 360) / PRIZES.length;
                return (
                  <View
                    key={prize.id}
                    style={[
                      styles.segment,
                      {
                        transform: [
                          { rotate: `${angle}deg` },
                          { translateY: -70 },
                        ],
                      },
                    ]}
                  >
                    <View style={[styles.segmentPill, { backgroundColor: prize.color }]}>
                      <Text style={[styles.segmentLabel, { color: prize.text }]}>
                        +{prize.label}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Center Hub */}
              <View style={[styles.centerHub, { backgroundColor: primary }]}>
                <CoinIcon size={24} />
              </View>
            </Animated.View>
          </View>

          {/* Status / Ad Toast */}
          {statusMessage && (
            <View style={styles.statusToast}>
              <Text style={styles.statusToastText}>{statusMessage}</Text>
            </View>
          )}

          {/* Won Message Banner */}
          {wonPrize && (
            <View style={styles.wonBanner}>
              <Text style={styles.wonTitle}>🎉 YOU WON +{wonPrize.amount} COINS! 🎉</Text>
              <Text style={styles.wonSub}>Added directly to your wallet</Text>
            </View>
          )}

          {/* Explanation Note for User */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {canFreeSpin
                ? '🎁 1 Free Spin daily! Get 100 to 2000 bonus coins.'
                : '✅ Daily free spin used! Click below to watch a short video & get extra spin.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {canFreeSpin ? (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSpinning}
                onPress={() => handleSpin(false)}
                style={[
                  styles.spinBtn,
                  { backgroundColor: '#10B981' },
                  isSpinning && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.spinBtnText}>
                  {isSpinning ? 'SPINNING...' : 'FREE DAILY SPIN! 🎁'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSpinning || isLoadingAd}
                onPress={handleWatchAdSpin}
                style={[
                  styles.spinBtn,
                  { backgroundColor: '#F59E0B' },
                  (isSpinning || isLoadingAd) && { opacity: 0.7 },
                ]}
              >
                {isLoadingAd ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.spinBtnText}>LOADING AD...</Text>
                  </View>
                ) : (
                  <Text style={styles.spinBtnText}>
                    {isSpinning ? 'SPINNING...' : '🎬 WATCH AD FOR EXTRA SPIN'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 6,
    gap: 6,
  },
  walletLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  walletCoins: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
  },
  wheelStage: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  arrowPointer: {
    position: 'absolute',
    top: -12,
    zIndex: 99,
  },
  arrowPointerText: {
    color: '#FACC15',
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  wheelContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#0F172A',
    borderWidth: 6,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  segment: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  segmentPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  centerHub: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  statusToast: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 6,
  },
  statusToastText: {
    color: '#FDE047',
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  wonBanner: {
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
    alignItems: 'center',
  },
  wonTitle: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  wonSub: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 6,
    width: '100%',
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 6,
  },
  spinBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
