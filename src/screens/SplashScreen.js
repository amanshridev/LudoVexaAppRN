import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  Easing,
} from 'react-native';
import { LudoVexaLogo, CrownIcon, DiceIcon } from '../components/ui/AppIcons';

export default function SplashScreen({ onFinish }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // 1. Subtle rhythmic logo breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Gentle levitation / floating effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Mini spinning dice animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 4. Exact 5-second smooth loading progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        onFinish?.();
      }, 3000);
    });

    const listener = progressAnim.addListener(({ value }) => {
      setPercent(Math.floor(value * 100));
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, [progressAnim, pulseAnim, floatAnim, spinAnim, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const diceSpin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Dynamic game loading status message based on percentage
  const getLoadingMessage = () => {
    if (percent < 25) {
      return 'Rolling lucky dice...';
    }
    if (percent < 55) {
      return 'Setting up 4-color board...';
    }
    if (percent < 85) {
      return 'Polishing royal tokens...';
    }
    return 'Ready to roll & win!';
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onFinish}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#050B1A" />

      {/* 4-Color Ludo Corner Ambient Glow Flares */}
      <View style={[styles.cornerGlow, styles.glowGreen]} />
      <View style={[styles.cornerGlow, styles.glowRed]} />
      <View style={[styles.cornerGlow, styles.glowBlue]} />
      <View style={[styles.cornerGlow, styles.glowYellow]} />

      {/* Subtle Star Sparkles */}
      <View style={[styles.sparkle, styles.sp1]} />
      <View style={[styles.sparkle, styles.sp2]} />
      <View style={[styles.sparkle, styles.sp3]} />
      <View style={[styles.sparkle, styles.sp4]} />
      <View style={[styles.sparkle, styles.sp5]} />
      <View style={[styles.sparkle, styles.sp6]} />

      {/* Center Theatrical Radial Aura */}
      <View style={styles.centerStageAura} />

      {/* Center Hero: Floating 3D Logo & Royal Title */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
            },
          ]}
        >
          {/* Golden Specular Halo behind logo */}
          <View style={styles.logoHalo} />
          <View style={styles.logoCard}>
            <LudoVexaLogo size={164} />
          </View>
        </Animated.View>

        {/* Brand Title with Crown */}
        <View style={styles.brandContainer}>
          <View style={styles.crownWrapper}>
            <CrownIcon size={30} />
          </View>
          <Text style={styles.brandTitle}>
            Ludo<Text style={styles.brandAccent}>Game</Text>
          </Text>

          {/* Glassmorphic Tagline Pill */}
          <View style={styles.taglinePill}>
            <Text style={styles.taglineText}>✦ ROLL • PLAY • WIN ✦</Text>
          </View>
        </View>
      </View>

      {/* Bottom Gamified Loading Progress Bar */}
      <View style={styles.bottomSection}>
        {/* Dynamic status line with spinning dice */}
        <View style={styles.statusRow}>
          <Animated.View style={{ transform: [{ rotate: diceSpin }] }}>
            <DiceIcon size={16} color="#FBBF24" />
          </Animated.View>
          <Text style={styles.statusText}>{getLoadingMessage()}</Text>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>

        {/* 3D Capsule Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[styles.progressBarFill, { width: progressWidth }]}
            >
              {/* Highlight sheen layer */}
              <View style={styles.progressSheen} />
            </Animated.View>
          </View>
        </View>

        <Text style={styles.footerHint}>Tap anywhere to skip • v1.0.0</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1A',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 46,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },

  // 4 Corner Ambient Glow Flares (Classic Ludo Colors)
  cornerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.14,
  },
  glowGreen: {
    top: -50,
    left: -50,
    backgroundColor: '#10B981',
  },
  glowRed: {
    top: -50,
    right: -50,
    backgroundColor: '#EF4444',
  },
  glowBlue: {
    bottom: 30,
    left: -60,
    backgroundColor: '#3B82F6',
  },
  glowYellow: {
    bottom: 30,
    right: -60,
    backgroundColor: '#F59E0B',
  },

  // Sparkles
  sparkle: {
    position: 'absolute',
    backgroundColor: '#FDE047',
    borderRadius: 3,
    opacity: 0.55,
  },
  sp1: { width: 4, height: 4, top: '14%', left: '20%' },
  sp2: { width: 3, height: 3, top: '22%', right: '22%', backgroundColor: '#38BDF8' },
  sp3: { width: 4, height: 4, top: '42%', left: '12%', backgroundColor: '#34D399' },
  sp4: { width: 3, height: 3, top: '62%', right: '16%', backgroundColor: '#F87171' },
  sp5: { width: 4, height: 4, top: '78%', left: '26%' },
  sp6: { width: 3, height: 3, top: '32%', right: '10%' },

  // Center Theatrical Aura
  centerStageAura: {
    position: 'absolute',
    top: '26%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1D4ED8',
    opacity: 0.22,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHalo: {
    position: 'absolute',
    width: 174,
    height: 174,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
  },
  logoCard: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
    backgroundColor: '#0F172A',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 22,
  },
  crownWrapper: {
    marginBottom: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  brandAccent: {
    color: '#FBBF24',
  },
  taglinePill: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 2,
  },

  // Bottom Loading Section
  bottomSection: {
    width: '88%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
    marginLeft: 8,
  },
  percentText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  progressBarWrapper: {
    width: '100%',
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  progressBarTrack: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  footerHint: {
    color: 'rgba(148, 163, 184, 0.65)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
