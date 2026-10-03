import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  Easing,
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
 * PinToken3D — Classic Ludo pawn/cone token.
 *
 * SVG viewBox: "0 0 100 130"
 *   Base ellipse  : cx=50 cy=118 rx=32 ry=8
 *   Cone body     : curved trapezoid from base to neck
 *   Neck ring     : white collar at y≈52
 *   Spherical head: cx=50 cy=34 r=22
 *
 * Resembles a real physical Ludo game piece with 3D shading.
 */
export default function PinToken3D({
  token,
  isMovable = false,
  onPress,
  size = 28,
}) {
  const colorConfig = PLAYER_COLORS[token.player] || PLAYER_COLORS.red;

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const liftAnim   = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

  // Continuous energetic jumping/bouncing & pulsing glow when movable (e.g. after rolling 6 or any playable number)
  useEffect(() => {
    if (isMovable) {
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 320, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 320, useNativeDriver: true }),
        ])
      );
      bounce.start();
      pulse.start();
      return () => {
        bounce.stop();
        pulse.stop();
      };
    } else {
      bounceAnim.setValue(0);
      pulseAnim.setValue(1.0);
    }
  }, [isMovable, bounceAnim, pulseAnim]);

  const handlePressIn  = () => { if (!isMovable) return; Animated.spring(liftAnim, { toValue: -8, friction: 5, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(liftAnim, { toValue: 0,  friction: 5, useNativeDriver: true }).start(); };

  // Unique gradient IDs (per token to avoid SVG id clashes)
  const bodyGrad  = `bd_${token.id}`;
  const headGrad  = `hd_${token.id}`;
  const headHl    = `hhl_${token.id}`;
  const neckGrad  = `nk_${token.id}`;
  const baseGrad  = `bs_${token.id}`;
  const shadowGrad = `sh_${token.id}`;

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

      {/* Pawn SVG — square, perfectly centred */}
      <Animated.View
        style={[
          styles.svgWrapper,
          {
            width: size,
            height: size,
            transform: [
              { translateY: Animated.add(liftAnim, bounceAnim) },
              { scale: isMovable ? pulseAnim : 1 },
            ],
          },
        ]}
      >
        <Svg
          width={size}
          height={size}
          viewBox="0 0 100 130"
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            {/* Cone body gradient — 3D lit from upper-left */}
            <LinearGradient id={bodyGrad} x1="20%" y1="0%" x2="85%" y2="100%">
              <Stop offset="0%"   stopColor={colorConfig.accent}  />
              <Stop offset="40%"  stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark}    />
            </LinearGradient>

            {/* Spherical head gradient — radial 3D ball */}
            <RadialGradient id={headGrad} cx="38%" cy="32%" r="62%" fx="35%" fy="28%">
              <Stop offset="0%"   stopColor="#FFFFFF"             stopOpacity="0.9" />
              <Stop offset="25%"  stopColor={colorConfig.accent}  />
              <Stop offset="70%"  stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark}    />
            </RadialGradient>

            {/* Specular highlight on head */}
            <RadialGradient id={headHl} cx="35%" cy="30%" r="40%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0"  />
            </RadialGradient>

            {/* Neck collar gradient */}
            <LinearGradient id={neckGrad} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7"  />
            </LinearGradient>

            {/* Base rim gradient */}
            <LinearGradient id={baseGrad} x1="20%" y1="0%" x2="80%" y2="100%">
              <Stop offset="0%"   stopColor={colorConfig.accent}  />
              <Stop offset="50%"  stopColor={colorConfig.primary} />
              <Stop offset="100%" stopColor={colorConfig.dark}    />
            </LinearGradient>

            {/* Ground shadow */}
            <RadialGradient id={shadowGrad} cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor="#000000" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
            </RadialGradient>
          </Defs>

          {/* ── Ground shadow ellipse ── */}
          <Ellipse cx="50" cy="122" rx="34" ry="7" fill={`url(#${shadowGrad})`} />

          {/* ── Base rim — thick elliptical disc ── */}
          <Ellipse cx="50" cy="112" rx="30" ry="8" fill={colorConfig.dark} />
          <Ellipse cx="50" cy="110" rx="30" ry="8" fill={`url(#${baseGrad})`} />
          {/* Base top face */}
          <Ellipse cx="50" cy="108" rx="28" ry="6" fill={colorConfig.primary} opacity={0.7} />

          {/* ── Cone body — curved trapezoid ── */}
          <Path
            d="M22 108 C22 108 30 60 38 55 L62 55 C70 60 78 108 78 108 Q65 116 50 116 Q35 116 22 108 Z"
            fill={`url(#${bodyGrad})`}
          />
          {/* Cone body right-side shadow for depth */}
          <Path
            d="M62 55 C70 60 78 108 78 108 Q65 116 50 116 L50 55 Z"
            fill="rgba(0,0,0,0.12)"
          />

          {/* ── Neck collar — white ring between head and cone ── */}
          <Ellipse cx="50" cy="54" rx="18" ry="5" fill={`url(#${neckGrad})`} />
          <Ellipse cx="50" cy="52" rx="16" ry="4" fill={colorConfig.primary} opacity={0.5} />

          {/* ── Spherical head ── */}
          {/* Head shadow underneath */}
          <Circle cx="50" cy="36" r="23" fill="rgba(0,0,0,0.15)" />
          {/* Head main sphere */}
          <Circle cx="50" cy="34" r="22" fill={`url(#${headGrad})`} />

          {/* ── Specular highlight on head ── */}
          <Ellipse
            cx="42"
            cy="26"
            rx="10"
            ry="7"
            transform="rotate(-20 42 26)"
            fill={`url(#${headHl})`}
          />

          {/* ── Glint dot ── */}
          <Circle cx="40" cy="24" r="3.5" fill="#FFFFFF" opacity={0.75} />

          {/* ── Shield aura (power-up) ── */}
          {token.shield && (
            <Ellipse
              cx="50"
              cy="70"
              rx="38"
              ry="55"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeDasharray="6,4"
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
