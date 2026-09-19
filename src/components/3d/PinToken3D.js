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
  Path,
  Ellipse,
} from 'react-native-svg';
import { PLAYER_COLORS } from '../../theme/colors';

/**
 * PinToken3D — renders a map-pin style token.
 *
 * SVG viewBox: "0 0 100 150"
 *   Head circle  : cx=50 cy=44 r=38
 *   White ring   : cx=50 cy=44 r=27
 *   Pupil dot    : cx=50 cy=44 r=14
 *   Needle       : tapered triangle pointing down to cy=150
 *
 * The SVG is rendered inside a square (size × size) container.
 * preserveAspectRatio="xMidYMid meet" keeps the pin centred within that square.
 */
export default function PinToken3D({
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
        Animated.timing(liftAnim, { toValue: -14, duration: 80, useNativeDriver: true }),
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

  const handlePressIn  = () => { if (!isMovable) return; Animated.spring(liftAnim, { toValue: -8, friction: 5, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(liftAnim, { toValue: 0,  friction: 5, useNativeDriver: true }).start(); };

  // Unique gradient IDs (per token to avoid SVG id clashes)
  const gid  = `hg_${token.id}`;
  const nid  = `ng_${token.id}`;
  const hlid = `hl_${token.id}`;
  const wid  = `wr_${token.id}`;

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

      {/* Pin SVG — square, perfectly centred */}
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
          viewBox="0 0 100 150"
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            {/* Radial gradient — main pin head */}
            <RadialGradient id={gid} cx="38%" cy="30%" r="65%" fx="32%" fy="25%">
              <Stop offset="0%"   stopColor="#FFFFFF"             stopOpacity="0.95" />
              <Stop offset="20%"  stopColor={colorConfig.accent} />
              <Stop offset="65%"  stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark} />
            </RadialGradient>

            {/* Linear gradient — needle */}
            <LinearGradient id={nid} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%"   stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark} stopOpacity="0.9" />
            </LinearGradient>

            {/* Specular highlight on head */}
            <LinearGradient id={hlid} x1="0%" y1="0%" x2="30%" y2="100%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0"  />
            </LinearGradient>

            {/* White ring inner gradient */}
            <RadialGradient id={wid} cx="40%" cy="35%" r="60%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.5" />
            </RadialGradient>
          </Defs>

          {/* ── Needle drop shadow ── */}
          <Path
            d="M30 76 L50 150 L70 76 Q60 86 50 86 Q40 86 30 76 Z"
            fill="rgba(0,0,0,0.2)"
            x={1}
            y={3}
          />

          {/* ── Needle body ── */}
          <Path
            d="M30 76 L50 150 L70 76 Q60 86 50 86 Q40 86 30 76 Z"
            fill={`url(#${nid})`}
          />

          {/* ── Head outer shadow ring ── */}
          <Circle cx="50" cy="44" r="40" fill="rgba(0,0,0,0.22)" />

          {/* ── Head — main coloured circle ── */}
          <Circle cx="50" cy="44" r="38" fill={`url(#${gid})`} />

          {/* ── White inner ring ── */}
          <Circle cx="50" cy="44" r="27" fill={`url(#${wid})`} />

          {/* ── Coloured pupil ── */}
          <Circle cx="50" cy="44" r="14" fill={colorConfig.primary} opacity={0.92} />

          {/* ── Glint on pupil ── */}
          <Circle cx="44" cy="38" r="5" fill="#FFFFFF" opacity={0.65} />

          {/* ── Specular highlight on head ── */}
          <Ellipse
            cx="38"
            cy="28"
            rx="12"
            ry="7"
            transform="rotate(-25 38 28)"
            fill={`url(#${hlid})`}
          />

          {/* ── Shield aura (power-up) ── */}
          {token.shield && (
            <Circle
              cx="50"
              cy="44"
              r="43"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeDasharray="6,4"
              opacity="0.95"
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

