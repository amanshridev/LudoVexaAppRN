import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Path,
  Ellipse,
  G,
} from 'react-native-svg';
import { PLAYER_COLORS } from '../../theme/colors';

export default function PinToken3D({
  token,
  isMovable = false,
  onPress,
  size = 28,
  offsetIndex = 0,
  totalOnTile = 1,
}) {
  const colorConfig = PLAYER_COLORS[token.player] || PLAYER_COLORS.red;

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;

  // Hop/jump animation when token step changes
  const prevStepRef = useRef(token.step);
  useEffect(() => {
    if (prevStepRef.current !== undefined && prevStepRef.current !== token.step && token.step >= 0) {
      prevStepRef.current = token.step;
      Animated.sequence([
        Animated.timing(liftAnim, {
          toValue: -16,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          duration: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      prevStepRef.current = token.step;
    }
  }, [token.step, liftAnim]);

  // Pulsing animation when movable
  useEffect(() => {
    if (isMovable) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
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
  }, [isMovable, pulseAnim]);

  const handlePressIn = () => {
    if (!isMovable) return;
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: -8,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(shadowScale, {
        toValue: 1.3,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(shadowScale, {
        toValue: 1.0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const gradId = `pin_grad_${token.id}`;
  const baseGradId = `base_grad_${token.id}`;
  const highlightGradId = `hl_grad_${token.id}`;

  return (
    <TouchableOpacity
      activeOpacity={isMovable ? 0.7 : 1}
      onPress={() => isMovable && onPress && onPress(token.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!isMovable}
      style={[
        styles.container,
        {
          width: size,
          height: size * 1.35,
        },
      ]}
    >
      {/* 3D Drop Shadow on board */}
      <Animated.View
        style={[
          styles.shadow,
          {
            width: size * 0.9,
            height: size * 0.4,
            bottom: 0,
            transform: [{ scale: shadowScale }],
          },
        ]}
      />

      {/* Pulsing Active Ring */}
      {isMovable && (
        <Animated.View
          style={[
            styles.halo,
            {
              width: size * 1.25,
              height: size * 1.25,
              borderColor: colorConfig.glow,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* 3D Pin Body */}
      <Animated.View
        style={[
          styles.pinWrapper,
          {
            width: size,
            height: size * 1.3,
            transform: [{ translateY: liftAnim }, { scale: isMovable ? pulseAnim : 1 }],
          },
        ]}
      >
        <Svg width={size} height={size * 1.3} viewBox="0 0 100 130">
          <Defs>
            {/* Radial Gradient for Pin Head */}
            <RadialGradient
              id={gradId}
              cx="35%"
              cy="30%"
              r="60%"
              fx="30%"
              fy="25%"
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="25%" stopColor={colorConfig.accent} />
              <Stop offset="70%" stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark} />
            </RadialGradient>

            {/* Base Bevel Gradient */}
            <LinearGradient id={baseGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <Stop offset="30%" stopColor={colorConfig.primary} />
              <Stop offset="85%" stopColor={colorConfig.dark} />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </LinearGradient>

            {/* Specular Highlight */}
            <LinearGradient id={highlightGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          <G>
            {/* 1. Base Bevel / Pedestal */}
            <Ellipse
              cx="50"
              cy="112"
              rx="40"
              ry="16"
              fill="#000000"
              opacity="0.35"
            />
            <Path
              d="M12 108 C12 118, 88 118, 88 108 L84 100 C84 94, 16 94, 16 100 Z"
              fill={`url(#${baseGradId})`}
            />
            {/* Base rim highlight */}
            <Ellipse
              cx="50"
              cy="100"
              rx="34"
              ry="11"
              fill={colorConfig.secondary}
            />
            <Ellipse
              cx="50"
              cy="98"
              rx="31"
              ry="9"
              fill={`url(#${gradId})`}
            />

            {/* 2. Sculpted Pin Stem (Slender Waist) */}
            <Path
              d="M32 96 C36 75, 40 60, 36 50 C38 46, 62 46, 64 50 C60 60, 64 75, 68 96 Z"
              fill={`url(#${baseGradId})`}
            />

            {/* Collar Ring */}
            <Ellipse
              cx="50"
              cy="52"
              rx="17"
              ry="6"
              fill="#FBBF24"
              opacity="0.9"
            />
            <Ellipse
              cx="50"
              cy="51"
              rx="15"
              ry="4"
              fill="#FFFBEB"
            />

            {/* 3. Spherical 3D Pin Head */}
            <Circle
              cx="50"
              cy="34"
              r="24"
              fill={`url(#${gradId})`}
            />

            {/* Glossy Specular Reflection on head */}
            <Ellipse
              cx="43"
              cy="24"
              rx="10"
              ry="6"
              transform="rotate(-25 43 24)"
              fill={`url(#${highlightGradId})`}
            />

            {/* Shield Aura if active */}
            {token.shield && (
              <Circle
                cx="50"
                cy="34"
                r="28"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="6, 4"
                opacity="0.95"
              />
            )}
          </G>
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 20,
  },
  halo: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2.5,
    top: -2,
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
