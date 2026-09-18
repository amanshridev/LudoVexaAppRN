import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { SoundFX } from '../../utils/soundFX.js';

/**
 * 3D Flipping Cube Dice
 * - 100% Native-compatible 3D multi-axis perspective tumble (perspective: 900)
 * - Rapid face-flipping animation showing faces 1, 2, 3, 4, 5, 6 during the roll
 * - Plays 3D wooden dice flipping sound on roll
 * - Settle pop & victory golden glow ring on landing
 */
export default function Cube3DFlippingDice({
  targetValue = 6,
  isRolling = false,
  onPress,
  disabled = false,
  size = 54,
  themeColor = '#EF4444',
}) {
  const [displayValue, setDisplayValue] = useState(targetValue || 6);

  // Animated values
  const rotX = useRef(new Animated.Value(0)).current;
  const rotY = useRef(new Animated.Value(0)).current;
  const rotZ = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Sync display value when targetValue changes while not rolling
  useEffect(() => {
    if (!isRolling) {
      setDisplayValue(targetValue || 6);
    }
  }, [targetValue, isRolling]);

  // Idle pulse animation when active turn
  useEffect(() => {
    if (!isRolling && !disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1.0);
    }
  }, [isRolling, disabled, pulseAnim]);

  // 3D Multi-Axis Flip & Tumble Roll Physics
  useEffect(() => {
    if (isRolling) {
      // Play 3D dice flipping sound!
      SoundFX.diceFlip();

      // Cycle rapidly through faces 1..6 during the roll so every side is shown flipping
      let stepCount = 0;
      const shuffleInterval = setInterval(() => {
        stepCount++;
        setDisplayValue((prev) => (prev % 6) + 1);
        if (stepCount >= 9) {
          clearInterval(shuffleInterval);
          setDisplayValue(targetValue || 6);
        }
      }, 70);

      // Reset animated transform values
      rotX.setValue(0);
      rotY.setValue(0);
      rotZ.setValue(0);
      translateY.setValue(0);

      Animated.parallel([
        // High-Arc 3D Jump & Double Bounce
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -size * 0.75,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 160,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -size * 0.25,
            duration: 110,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 140,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),

        // Dynamic 3D Floor Shadow
        Animated.sequence([
          Animated.timing(shadowScale, { toValue: 0.5, duration: 220, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 1.2, duration: 160, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 0.8, duration: 110, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 1.0, duration: 140, useNativeDriver: true }),
        ]),

        // 3D Multi-axis Rotational Tumble
        Animated.timing(rotX, {
          toValue: 1080,
          duration: 630,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotY, {
          toValue: 1440,
          duration: 630,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotZ, {
          toValue: 720,
          duration: 630,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        clearInterval(shuffleInterval);
        setDisplayValue(targetValue || 6);

        // Landing reveal pop animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.0,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();

        // Landing gold glow flash
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.9, duration: 120, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start();
      });

      return () => clearInterval(shuffleInterval);
    }
  }, [isRolling, targetValue, rotX, rotY, rotZ, translateY, shadowScale, scaleAnim, glowOpacity, size]);

  const rotXStr = rotX.interpolate({
    inputRange: [0, 1080],
    outputRange: ['0deg', '1080deg'],
  });
  const rotYStr = rotY.interpolate({
    inputRange: [0, 1440],
    outputRange: ['0deg', '1440deg'],
  });
  const rotZStr = rotZ.interpolate({
    inputRange: [0, 720],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      style={[styles.container, { width: size + 16, height: size + 16 }]}
    >
      {/* Dynamic 3D Floor Shadow */}
      <Animated.View
        style={[
          styles.floorShadow,
          {
            width: size * 0.9,
            height: size * 0.28,
            bottom: 2,
            transform: [{ scale: shadowScale }],
          },
        ]}
      />

      {/* Golden Pulse Ring when Active */}
      {!disabled && !isRolling && (
        <Animated.View
          style={[
            styles.idleRing,
            {
              width: size + 10,
              height: size + 10,
              borderRadius: (size + 10) / 4,
              borderColor: '#FACC15',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Landing Flash Glow */}
      <Animated.View
        style={[
          styles.glowFlash,
          {
            width: size + 14,
            height: size + 14,
            borderRadius: (size + 14) / 4,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* 3D Tumbling Cube Body */}
      <Animated.View
        style={[
          styles.cubeBody,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
            transform: [
              { perspective: 900 },
              { translateY },
              { rotateX: rotXStr },
              { rotateY: rotYStr },
              { rotateZ: rotZStr },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={[styles.face, { width: size, height: size, borderRadius: size / 4 }]}>
          {/* Beveled Top Specular Edge */}
          <View style={styles.specularTop} />

          {/* 3D Face Pips */}
          <CubeFacePips val={displayValue} size={size} />

          {/* Depth Bottom Edge */}
          <View style={styles.depthBottom} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function CubeFacePips({ val = 6, size }) {
  const isOne = val === 1;
  const pipSize = isOne ? size * 0.28 : size * 0.18;
  const pipColor = isOne ? '#DC2626' : '#1E293B';

  const Pip = () => (
    <View
      style={[
        styles.pip,
        {
          width: pipSize,
          height: pipSize,
          borderRadius: pipSize / 2,
          backgroundColor: pipColor,
        },
      ]}
    >
      <View
        style={[
          styles.pipGlint,
          {
            width: pipSize * 0.35,
            height: pipSize * 0.35,
            borderRadius: 999,
          },
        ]}
      />
    </View>
  );

  switch (val) {
    case 1:
      return (
        <View style={styles.centerWrap}>
          <Pip />
        </View>
      );
    case 2:
      return (
        <View style={styles.diagonalTwo}>
          <View style={styles.topRight}><Pip /></View>
          <View style={styles.bottomLeft}><Pip /></View>
        </View>
      );
    case 3:
      return (
        <View style={styles.diagonalThree}>
          <View style={styles.topRight}><Pip /></View>
          <View style={styles.centerItem}><Pip /></View>
          <View style={styles.bottomLeft}><Pip /></View>
        </View>
      );
    case 4:
      return (
        <View style={styles.gridFour}>
          <View style={styles.row}><Pip /><Pip /></View>
          <View style={styles.row}><Pip /><Pip /></View>
        </View>
      );
    case 5:
      return (
        <View style={styles.gridFive}>
          <View style={styles.row}><Pip /><Pip /></View>
          <View style={styles.centerItem}><Pip /></View>
          <View style={styles.row}><Pip /><Pip /></View>
        </View>
      );
    case 6:
    default:
      return (
        <View style={styles.gridSix}>
          <View style={styles.col}><Pip /><Pip /><Pip /></View>
          <View style={styles.col}><Pip /><Pip /><Pip /></View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floorShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 20,
  },
  idleRing: {
    position: 'absolute',
    borderWidth: 2.5,
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  glowFlash: {
    position: 'absolute',
    backgroundColor: '#FDE047',
    borderWidth: 2.5,
    borderColor: '#EAB308',
  },
  cubeBody: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  face: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  depthBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#CBD5E1',
  },
  pip: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 1,
  },
  pipGlint: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagonalTwo: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 3,
  },
  topRight: {
    alignSelf: 'flex-end',
  },
  bottomLeft: {
    alignSelf: 'flex-start',
  },
  diagonalThree: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 2,
  },
  centerItem: {
    alignSelf: 'center',
  },
  gridFour: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 2,
  },
  gridFive: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 1,
  },
  gridSix: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    justifyContent: 'space-between',
  },
});
