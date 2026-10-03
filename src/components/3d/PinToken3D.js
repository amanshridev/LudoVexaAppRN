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
const PinToken3D = React.memo(function PinToken3D({
  token,
  isMovable = false,
  onPress,
  size = 28,
  disabled = false,
}) {
  const colorConfig = PLAYER_COLORS[token.player] || PLAYER_COLORS.red;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const movableHopAnim = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);

  // Unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      pulseAnim.stopAnimation();
      scaleAnim.stopAnimation();
      shakeAnim.stopAnimation();
      liftAnim.stopAnimation();
      movableHopAnim.stopAnimation();
    };
  }, [pulseAnim, scaleAnim, shakeAnim, liftAnim, movableHopAnim]);

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
        Animated.timing(liftAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    } else {
      prevStepRef.current = token.step;
    }
  }, [token.step, liftAnim]);

  // Ludo King style gentle bobbing hop + scale breathing for movable tokens (zero color stains)
  useEffect(() => {
    if (isMovable) {
      const hopLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(movableHopAnim, {
              toValue: -5,
              duration: 340,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.06,
              duration: 340,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(movableHopAnim, {
              toValue: 0,
              duration: 340,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 340,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(100),
        ])
      );
      hopLoop.start();
      return () => {
        hopLoop.stop();
      };
    } else {
      movableHopAnim.stopAnimation();
      movableHopAnim.setValue(0);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1.0);
    }
  }, [isMovable, movableHopAnim, pulseAnim]);

  const handlePress = () => {
    if (disabled) return;

    if (isMovable) {
      // Tap on valid token: quick squish (1 -> 0.85 -> 1.2 -> 1), then hop starts
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1.0);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 50,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 60,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMountedRef.current && onPress) {
          onPress(token.id);
        }
      });
    } else {
      // Tap on invalid token: small shake
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  };

  // Unique gradient IDs (per token to avoid SVG id clashes)
  // Unique gradient IDs (per token to avoid SVG id clashes)
  const tokenKey = token.id || token.player || 'default';
  const bodyGrad = `bd_${tokenKey}`;
  const headGrad = `hd_${tokenKey}`;
  const collarGrad = `col_${tokenKey}`;
  const baseGrad = `bs_${tokenKey}`;
  const shadowGrad = `sh_${tokenKey}`;

  const tokenHeight = size * 1.3;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, { width: size, height: tokenHeight }]}
    >
      {/* Pawn SVG with transforms */}
      <Animated.View
        style={[
          styles.svgWrapper,
          {
            width: size,
            height: tokenHeight,
            transform: [
              { translateY: movableHopAnim },
              { scale: isMovable ? pulseAnim : 1 },
            ],
          },
        ]}
      >
        <Animated.View
          style={{
            width: size,
            height: tokenHeight,
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
              { translateY: liftAnim },
            ],
          }}
        >
          <Svg
            width={size}
            height={tokenHeight}
            viewBox="0 0 100 130"
            preserveAspectRatio="xMidYMid meet"
          >
            <Defs>
              {/* Cone body gradient — 3D lit from upper-left */}
              <LinearGradient id={bodyGrad} x1="15%" y1="0%" x2="88%" y2="100%">
                <Stop offset="0%" stopColor={colorConfig.accent || '#FB7185'} />
                <Stop offset="28%" stopColor={colorConfig.primary || '#DC2626'} />
                <Stop offset="75%" stopColor={colorConfig.secondary || '#991B1B'} />
                <Stop offset="100%" stopColor={colorConfig.dark || '#7F1D1D'} />
              </LinearGradient>

              {/* Spherical head gradient — radial 3D ball */}
              <RadialGradient id={headGrad} cx="36%" cy="28%" r="65%" fx="32%" fy="24%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="18%" stopColor={colorConfig.accent || '#FB7185'} />
                <Stop offset="55%" stopColor={colorConfig.primary || '#DC2626'} />
                <Stop offset="88%" stopColor={colorConfig.secondary || '#991B1B'} />
                <Stop offset="100%" stopColor={colorConfig.dark || '#7F1D1D'} />
              </RadialGradient>

              {/* Gold metallic collar ring */}
              <LinearGradient id={collarGrad} x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FEF08A" />
                <Stop offset="35%" stopColor="#FACC15" />
                <Stop offset="70%" stopColor="#CA8A04" />
                <Stop offset="100%" stopColor="#713F12" />
              </LinearGradient>

              {/* Base rim gradient */}
              <LinearGradient id={baseGrad} x1="15%" y1="0%" x2="85%" y2="100%">
                <Stop offset="0%" stopColor={colorConfig.accent || '#FB7185'} />
                <Stop offset="45%" stopColor={colorConfig.primary || '#DC2626'} />
                <Stop offset="100%" stopColor={colorConfig.dark || '#7F1D1D'} />
              </LinearGradient>

              {/* Ground shadow */}
              <RadialGradient id={shadowGrad} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </RadialGradient>
            </Defs>

            {/* ── Ground shadow ellipse ── */}
            <Ellipse cx="50" cy="115" rx="36" ry="5.5" fill={`url(#${shadowGrad})`} />

            {/* ── Weighted Base Tier 1 (bottom bevel) ── */}
            <Ellipse cx="50" cy="109" rx="35" ry="7.5" fill={colorConfig.dark || '#4C0519'} />

            {/* ── Weighted Base Tier 2 (main rim) ── */}
            <Ellipse cx="50" cy="106" rx="34" ry="7" fill={`url(#${baseGrad})`} />

            {/* ── Base top face ── */}
            <Ellipse cx="50" cy="103.5" rx="30" ry="5.5" fill={colorConfig.primary || '#DC2626'} opacity={0.8} />

            {/* ── Cone body — curved bell cone ── */}
            <Path
              d="M 18 103.5 C 23 80 32 48 35 43 L 65 43 C 68 48 77 80 82 103.5 C 72 110 28 110 18 103.5 Z"
              fill={`url(#${bodyGrad})`}
            />

            {/* ── Cone body left specular shine streak ── */}
            <Path
              d="M 22 103 C 26 80 33 52 36 44 L 43 44 C 40 52 33 80 29 103 Z"
              fill="rgba(255,255,255,0.26)"
            />

            {/* ── Cone body right core shadow for depth ── */}
            <Path
              d="M 65 43 C 68 48 77 80 82 103.5 C 74 108 60 109 55 106 C 58 82 63 50 65 43 Z"
              fill="rgba(0,0,0,0.18)"
            />

            {/* ── Neck collar — Polished Gold Metallic Ring ── */}
            <Ellipse cx="50" cy="45" rx="17.5" ry="4.5" fill="#713F12" />
            <Ellipse cx="50" cy="43.5" rx="17" ry="4" fill={`url(#${collarGrad})`} />

            {/* ── Spherical head ── */}
            {/* Head shadow underneath */}
            <Circle cx="50" cy="25" r="21" fill="rgba(0,0,0,0.18)" />
            {/* Head main sphere */}
            <Circle cx="50" cy="23.5" r="20.5" fill={`url(#${headGrad})`} />

            {/* ── Specular highlight on head ── */}
            <Ellipse
              cx="42.5"
              cy="16.5"
              rx="8.5"
              ry="5.5"
              transform="rotate(-25 42.5 16.5)"
              fill="#FFFFFF"
              opacity={0.65}
            />

            {/* ── Glint dot ── */}
            <Circle cx="40" cy="14" r="3" fill="#FFFFFF" opacity={0.95} />

            {/* ── Shield aura (power-up) ── */}
            {token.shield && (
              <Ellipse
                cx="50"
                cy="62"
                rx="38"
                ry="52"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray="6,4"
                opacity="0.9"
              />
            )}
          </Svg>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default PinToken3D;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
