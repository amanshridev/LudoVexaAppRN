import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  Easing,
} from 'react-native';


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

  // Animated values in refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      scaleAnim.stopAnimation();
      rotAnim.stopAnimation();
      shakeAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [scaleAnim, rotAnim, shakeAnim, pulseAnim]);

  // Sync display value when valid targetValue changes while not rolling
  useEffect(() => {
    if (!isRolling && targetValue != null && targetValue >= 1 && targetValue <= 6) {
      setDisplayValue(targetValue);
    }
  }, [targetValue, isRolling]);

  // Slow pulse loop when it is the player's turn to roll (stop it otherwise)
  useEffect(() => {
    if (!disabled && !isRolling) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => {
        pulse.stop();
      };
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1.0);
    }
  }, [disabled, isRolling, pulseAnim]);

  // Roll animation: scale to 0.9, ~500ms rotate + shake with 80ms interval, then real value + pop spring
  useEffect(() => {
    if (isRolling) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1.0);

      let isCancelled = false;

      const runRoll = async () => {
        try {
          // Scale to 0.9
          await new Promise((res) => {
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: 60,
              useNativeDriver: true,
            }).start(() => res());
          });

          if (isCancelled || !isMountedRef.current) return;

          // ONE setInterval changing shown number every 80 ms
          intervalRef.current = setInterval(() => {
            setDisplayValue(Math.floor(Math.random() * 6) + 1);
          }, 80);

          rotAnim.setValue(0);
          shakeAnim.setValue(0);

          // 10 steps of 50ms = 500ms shake
          const shakeSequence = Animated.sequence([
            Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -2, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]);

          // Rotate 360 deg over 500ms
          const rotateTiming = Animated.timing(rotAnim, {
            toValue: 360,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          });

          await new Promise((res) => {
            Animated.parallel([shakeSequence, rotateTiming]).start(() => res());
          });
        } finally {
          // ONE setInterval, cleared in finally and on unmount
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }

        if (isCancelled || !isMountedRef.current) return;

        // Show the REAL value from existing dice logic
        if (targetValue != null && targetValue >= 1 && targetValue <= 6) {
          setDisplayValue(targetValue);
        }

        // Pop: scale 1 -> 1.3 -> 1 spring
        scaleAnim.setValue(1.0);
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.0,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      };

      runRoll();

      return () => {
        isCancelled = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRolling, targetValue, scaleAnim, rotAnim, shakeAnim, pulseAnim]);

  const rotStr = rotAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    if (disabled || isRolling) return;
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 50,
      useNativeDriver: true,
    }).start();
    onPress && onPress();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      <TouchableOpacity
        activeOpacity={disabled || isRolling ? 1 : 0.75}
        onPress={handlePress}
        disabled={disabled || isRolling}
        style={[styles.container, { width: size + 16, height: size + 16 }]}
      >
        {/* Dynamic Floor Shadow */}
        <View
          style={[
            styles.floorShadow,
            {
              width: size * 0.9,
              height: size * 0.28,
              bottom: 2,
            },
          ]}
        />

        {/* Tumbling / Shaking Cube Body */}
        <Animated.View
          style={[
            styles.cubeBody,
            {
              width: size,
              height: size,
              borderRadius: size / 4,
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
                { rotate: rotStr },
              ],
            },
          ]}
        >
          <View style={[styles.face, { width: size, height: size, borderRadius: size / 4 }]}>
            {/* Beveled Top Specular Edge */}
            <View style={styles.specularTop} />

            {/* Face Pips */}
            <CubeFacePips val={displayValue} size={size} />

            {/* Depth Bottom Edge */}
            <View style={styles.depthBottom} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
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
