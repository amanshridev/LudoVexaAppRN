import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Ellipse,
} from 'react-native-svg';
import { PLAYER_COLORS } from '../../theme/colors';

/**
 * BallToken3D — Classic Ludo glossy spherical ball token.
 *
 * SVG viewBox: "0 0 100 100"
 *   Shadow ellipse : cx=50 cy=88 rx=28 ry=6
 *   Ball sphere    : cx=50 cy=46 r=36
 *   Specular       : radial highlight top-left
 *   Glint dot      : small white circle
 *
 * Resembles a real physical Ludo ball/marble game piece with 3D shading.
 */
export default function BallToken3D({
  token,
  isMovable = false,
  onPress,
  size = 28,
}) {
  const colorConfig = PLAYER_COLORS[token.player] || PLAYER_COLORS.red;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const liftAnim  = useRef(new Animated.Value(0)).current;

  // Hop animation when token moves
  const prevStepRef = useRef(token.step);
  useEffect(() => {
    if (
      prevStepRef.current !== undefined &&
      prevStepRef.current !== token.step &&
      token.step >= 0
    ) {
      prevStepRef.current = token.step;
      Animated.sequence([
        Animated.timing(liftAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(liftAnim, { toValue: 0,   duration: 80, useNativeDriver: true }),
      ]).start();
    } else {
      prevStepRef.current = token.step;
    }
  }, [token.step, liftAnim]);

  // Pulse glow when movable
  useEffect(() => {
    if (isMovable) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 480, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 480, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1.0);
    }
  }, [isMovable, pulseAnim]);

  const handlePressIn  = () => { if (!isMovable) return; Animated.spring(liftAnim, { toValue: -6, friction: 5, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(liftAnim, { toValue: 0,  friction: 5, useNativeDriver: true }).start(); };

  // Unique gradient IDs (per token to avoid SVG id clashes)
  const ballGrad   = `bg_${token.id}`;
  const hlGrad     = `hl_${token.id}`;
  const shadowGrad = `sg_${token.id}`;
  const rimGrad    = `rg_${token.id}`;

  return (
    <TouchableOpacity
      activeOpacity={isMovable ? 0.7 : 1}
      onPress={() => isMovable && onPress && onPress(token.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!isMovable}
      style={[styles.container, { width: size, height: size }]}
    >
      {/* Glow halo ring when movable */}
      {isMovable && (
        <Animated.View
          style={[
            styles.halo,
            {
              width: size * 1.3,
              height: size * 1.3,
              borderRadius: size * 0.65,
              borderColor: colorConfig.glow,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Ball SVG — square, perfectly centred */}
      <Animated.View
        style={[
          styles.svgWrapper,
          {
            width: size,
            height: size,
            transform: [
              { translateY: liftAnim },
              { scale: isMovable ? pulseAnim : 1 },
            ],
          },
        ]}
      >
        <Svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            {/* Main ball gradient — radial 3D sphere lit from upper-left */}
            <RadialGradient id={ballGrad} cx="38%" cy="35%" r="60%" fx="35%" fy="30%">
              <Stop offset="0%"   stopColor={colorConfig.light || colorConfig.accent}  stopOpacity="0.95" />
              <Stop offset="30%"  stopColor={colorConfig.accent || colorConfig.primary} />
              <Stop offset="65%"  stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark} />
            </RadialGradient>

            {/* Specular highlight — bright white reflection */}
            <RadialGradient id={hlGrad} cx="36%" cy="30%" r="35%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="60%"  stopColor="#FFFFFF" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </RadialGradient>

            {/* Ground shadow gradient */}
            <RadialGradient id={shadowGrad} cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="#000000" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
            </RadialGradient>

            {/* Rim light — subtle bottom-right edge highlight */}
            <RadialGradient id={rimGrad} cx="65%" cy="70%" r="40%">
              <Stop offset="0%"   stopColor={colorConfig.light || colorConfig.accent} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={colorConfig.dark} stopOpacity="0.0" />
            </RadialGradient>
          </Defs>

          {/* ── Ground shadow ellipse ── */}
          <Ellipse cx="50" cy="88" rx="30" ry="7" fill={`url(#${shadowGrad})`} />

          {/* ── Main ball sphere ── */}
          {/* Dark outline ring for depth */}
          <Circle cx="50" cy="48" r="37" fill={colorConfig.dark} opacity={0.4} />
          {/* Ball body */}
          <Circle cx="50" cy="46" r="36" fill={`url(#${ballGrad})`} />

          {/* ── Rim light on bottom-right ── */}
          <Circle cx="50" cy="46" r="34" fill={`url(#${rimGrad})`} />

          {/* ── Specular highlight ── */}
          <Ellipse
            cx="38"
            cy="34"
            rx="16"
            ry="12"
            transform="rotate(-15 38 34)"
            fill={`url(#${hlGrad})`}
          />

          {/* ── Glint dot (bright white spot) ── */}
          <Circle cx="34" cy="30" r="4" fill="#FFFFFF" opacity={0.85} />
          {/* Secondary smaller glint */}
          <Circle cx="42" cy="26" r="2" fill="#FFFFFF" opacity={0.5} />

          {/* ── Shield aura (power-up) ── */}
          {token.shield && (
            <Circle
              cx="50"
              cy="46"
              r="42"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeDasharray="5,3"
              opacity="0.9"
            />
          )}
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
  halo: {
    position: 'absolute',
    borderWidth: 2.5,
    opacity: 0.85,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
