import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Easing,
} from 'react-native';

/**
 * Premium Traditional Ivory 3D Rolling Dice
 * - Buttery-smooth 60 FPS native driver physics
 * - Stage 1: Anticipation Shake & Rattle
 * - Stage 2: 3D High-Arc Tumble with Spin & Tilt
 * - Stage 3: Realistic Double-Bounce Surface Settle
 * - Stage 4: Number Reveal Pop & Golden Glow
 * - Traditional Ivory look: Face 1 is bold Ruby Red, 2-6 are deep Charcoal
 */
export default function TraditionalRollingDice({
  value = 6,
  isRolling = false,
  onPress,
  disabled = false,
  size = 64,
}) {
  const [displayValue, setDisplayValue] = useState(value);

  // Animated values (all driven by native driver for 60fps smoothness)
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Sync display value when roll ends
  useEffect(() => {
    if (!isRolling) {
      setDisplayValue(value);
      // Reveal pop animation on landing
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.14,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Soft glow flash
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [value, isRolling, glowOpacity, scaleAnim]);

  // Idle breathing pulse when it's your turn to roll
  useEffect(() => {
    if (!isRolling && !disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 550,
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

  // 60 FPS Native Physical Roll Simulation
  useEffect(() => {
    if (isRolling) {
      // Rapid visual face shuffle without causing heavy JS re-render bottlenecks
      let shuffleCount = 0;
      const shuffleTimer = setInterval(() => {
        shuffleCount++;
        setDisplayValue((prev) => ((prev % 6) + 1));
        if (shuffleCount >= 8) {
          clearInterval(shuffleTimer);
          setDisplayValue(value);
        }
      }, 75);

      // Reset transforms
      translateY.setValue(0);
      translateX.setValue(0);
      rotateAnim.setValue(0);
      tiltX.setValue(0);
      tiltY.setValue(0);

      Animated.parallel([
        // Stage 1: Shake & Arc Jump with Double Bounce
        Animated.sequence([
          // Quick anticipation shake
          Animated.timing(translateX, { toValue: -6, duration: 40, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 6, duration: 40, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -4, duration: 40, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 40, useNativeDriver: true }),

          // High Arc Toss
          Animated.timing(translateY, {
            toValue: -size * 0.85,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // First Impact Slam
          Animated.timing(translateY, {
            toValue: 0,
            duration: 160,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          // Second Bounce
          Animated.timing(translateY, {
            toValue: -size * 0.3,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // Final Settle
          Animated.timing(translateY, {
            toValue: 0,
            duration: 140,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),

        // Drop shadow reacts dynamically to distance from surface
        Animated.sequence([
          Animated.timing(shadowScale, { toValue: 0.5, duration: 380, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 1.25, duration: 160, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 0.75, duration: 120, useNativeDriver: true }),
          Animated.timing(shadowScale, { toValue: 1.0, duration: 140, useNativeDriver: true }),
        ]),

        // Rapid 3D Rotational Spin (Tumbling across axes)
        Animated.timing(rotateAnim, {
          toValue: 720,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        // 3D Tilt wobbles (X and Y Euler pitch/yaw)
        Animated.sequence([
          Animated.timing(tiltX, { toValue: 40, duration: 180, useNativeDriver: true }),
          Animated.timing(tiltX, { toValue: -35, duration: 200, useNativeDriver: true }),
          Animated.timing(tiltX, { toValue: 15, duration: 180, useNativeDriver: true }),
          Animated.timing(tiltX, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(tiltY, { toValue: -45, duration: 180, useNativeDriver: true }),
          Animated.timing(tiltY, { toValue: 40, duration: 200, useNativeDriver: true }),
          Animated.timing(tiltY, { toValue: -15, duration: 180, useNativeDriver: true }),
          Animated.timing(tiltY, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start(() => {
        clearInterval(shuffleTimer);
        setDisplayValue(value);
      });

      return () => clearInterval(shuffleTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling, value]);

  const rotateStr = rotateAnim.interpolate({
    inputRange: [0, 720],
    outputRange: ['0deg', '720deg'],
  });
  const tiltXStr = tiltX.interpolate({
    inputRange: [-90, 90],
    outputRange: ['-90deg', '90deg'],
  });
  const tiltYStr = tiltY.interpolate({
    inputRange: [-90, 90],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      onPress={!disabled ? onPress : undefined}
      style={[styles.container, { width: size + 16, height: size + 16 }]}
    >
      {/* Dynamic 3D Contact Shadow on Felt/Board */}
      <Animated.View
        style={[
          styles.floorShadow,
          {
            width: size * 0.92,
            height: size * 0.28,
            bottom: 3,
            transform: [{ scale: shadowScale }],
          },
        ]}
      />

      {/* Gold Victory Pulse Ring when Waiting to Roll */}
      {!disabled && !isRolling && (
        <Animated.View
          style={[
            styles.idleRing,
            {
              width: size + 10,
              height: size + 10,
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
            transform: [
              { perspective: 900 },
              { translateY },
              { translateX },
              { rotateZ: rotateStr },
              { rotateX: tiltXStr },
              { rotateY: tiltYStr },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Traditional Ivory Face with Beveled Rim */}
        <View style={[styles.face, { width: size, height: size }]}>
          {/* Top Specular Edge Highlight */}
          <View style={styles.specularTop} />

          {/* Traditional Pips */}
          <TraditionalFacePips val={displayValue} size={size} />

          {/* Bottom Depth Shadow Edge */}
          <View style={styles.depthBottom} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function TraditionalFacePips({ val, size }) {
  const isOne = val === 1;
  const pipSize = isOne ? size * 0.28 : size * 0.19;

  // Face 1: Iconic bold Ruby Red pip. Faces 2-6: Deep Charcoal with subtle inset shadow
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
      {/* 3D Inset Light Glint */}
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
          <View style={styles.topRight}>
            <Pip />
          </View>
          <View style={styles.bottomLeft}>
            <Pip />
          </View>
        </View>
      );
    case 3:
      return (
        <View style={styles.diagonalThree}>
          <View style={styles.topRight}>
            <Pip />
          </View>
          <View style={styles.centerItem}>
            <Pip />
          </View>
          <View style={styles.bottomLeft}>
            <Pip />
          </View>
        </View>
      );
    case 4:
      return (
        <View style={styles.gridFour}>
          <View style={styles.row}>
            <Pip />
            <Pip />
          </View>
          <View style={styles.row}>
            <Pip />
            <Pip />
          </View>
        </View>
      );
    case 5:
      return (
        <View style={styles.gridFive}>
          <View style={styles.row}>
            <Pip />
            <Pip />
          </View>
          <View style={styles.centerItem}>
            <Pip />
          </View>
          <View style={styles.row}>
            <Pip />
            <Pip />
          </View>
        </View>
      );
    case 6:
    default:
      return (
        <View style={styles.gridSix}>
          <View style={styles.col}>
            <Pip />
            <Pip />
            <Pip />
          </View>
          <View style={styles.col}>
            <Pip />
            <Pip />
            <Pip />
          </View>
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
    borderRadius: 24,
  },
  idleRing: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  glowFlash: {
    position: 'absolute',
    borderRadius: 18,
    backgroundColor: '#FDE047',
    borderWidth: 3,
    borderColor: '#EAB308',
  },
  cubeBody: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  face: {
    backgroundColor: '#FAF8F5', // Authentic warm porcelain ivory
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 1.5,
  },
  pipGlint: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagonalTwo: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 4,
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
    padding: 3,
  },
  centerItem: {
    alignSelf: 'center',
  },
  gridFour: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 3,
  },
  gridFive: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 2,
  },
  gridSix: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    justifyContent: 'space-between',
  },
});
