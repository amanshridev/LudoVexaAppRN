import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LudoVexaLogo, PawnsGraphic } from '../components/ui/AppIcons';

export default function SplashScreen({ onFinish }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4500,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        onFinish?.();
      }, 15000);
    });

    const listener = progressAnim.addListener(({ value }) => {
      setPercent(Math.floor(value * 100));
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, [progressAnim, pulseAnim, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onFinish}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#071126" />

      {/* Decorative background stars */}
      <View style={[styles.starDot, { top: '12%', left: '15%' }]} />
      <View style={[styles.starDot, { top: '22%', right: '20%' }]} />
      <View style={[styles.starDot, { top: '45%', left: '10%' }]} />
      <View style={[styles.starDot, { top: '70%', right: '12%' }]} />
      <View style={[styles.starDot, { top: '80%', left: '25%' }]} />

      <View style={styles.centerContent}>
        {/* Ludo Vexa Vector 3D Logo */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LudoVexaLogo size={240} />
        </Animated.View>

        {/* 3D Pawns & Dice Vector Graphic */}
        <View style={styles.pawnsContainer}>
          <PawnsGraphic size={170} />
        </View>

        {/* Subtitle */}
        <Text style={styles.tagline}>Play • Roll • Win</Text>
      </View>

      {/* Bottom Loading Indicator */}
      <View style={styles.bottomSection}>
        <Text style={styles.loadingText}>Loading... {percent}%</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071126',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  starDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#38BDF8',
    opacity: 0.6,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  crownWrapper: {
    marginBottom: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: 4,
    textShadowColor: '#B45309',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 6,
    textAlign: 'center',
  },
  logoTextShadow: {
    position: 'absolute',
    fontSize: 54,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 4,
    top: 4,
    textAlign: 'center',
  },
  pawnsContainer: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  bottomSection: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
});
