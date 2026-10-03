import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { PLAYER_COLORS } from '../../theme/colors.js';
import PinToken3D from '../3d/PinToken3D.js';
import Cube3DFlippingDice from '../3d/Cube3DFlippingDice.js';

/**
 * Authentic Ludo King-Style Corner Player Dock
 * 1. Player Profile:
 *    - Round Avatar with Circular SVG Countdown Timer Ring (Green -> Yellow -> Red)
 *    - Name Badge directly below avatar
 *    - Crown 👑 (You) or Bot 🤖 Mini-Badge
 * 2. 3D Dice Station:
 *    - Dedicated 3D Beveled Dice Podium (touchable to roll)
 *    - Animated Bouncing Down-Arrow (⬇️ ROLL) pointing directly at the dice
 * 3. Symmetrical Layout:
 *    - Left Players (Red/Green): [ Profile ] [ Dice ⬇️ ]
 *    - Right Players (Yellow/Blue): [ Dice ⬇️ ] [ Profile ]
 */
export default function CornerPlayerDock({
  player = 'red',
  playerName = '',
  diceValue = 6,
  isTurn = false,
  isRolling = false,
  onRoll,
  canRoll = false,
  isBot = false,
  layout = 'left-badge', // 'left-badge' (dice on right) or 'right-badge' (dice on left)
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 380;

  // Responsive dimensions
  const svgSize = isSmall ? 44 : 48;
  const radius = isSmall ? 19 : 21;
  const strokeWidth = 3.5;
  const innerAvatarSize = isSmall ? 32 : 36;
  const pinSize = isSmall ? 18 : 22;
  const traySize = isSmall ? 42 : 46;
  const diceSize = isSmall ? 32 : 36;

  const circumference = 2 * Math.PI * radius;
  const pColor = PLAYER_COLORS[player] || PLAYER_COLORS.red;
  const isYou = playerName === 'You';
  const displayName = isYou ? 'You' : playerName || player.toUpperCase();

  // Animation values
  const arrowBounceAnim = useRef(new Animated.Value(0)).current;
  const avatarPulseAnim = useRef(new Animated.Value(1)).current;

  // Turn Countdown Progress (15-second standard Ludo timer)
  const [turnProgress, setTurnProgress] = useState(1);

  useEffect(() => {
    if (isTurn) {
      setTurnProgress(1);
      const startTime = Date.now();
      const totalDuration = 15000; // 15 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1 - elapsed / totalDuration);
        setTurnProgress(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setTurnProgress(1);
    }
  }, [isTurn]);

  // Down-arrow bouncing animation when player can roll
  useEffect(() => {
    if (isTurn && canRoll) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowBounceAnim, {
            toValue: 5,
            duration: 350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(arrowBounceAnim, {
            toValue: 0,
            duration: 350,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      arrowBounceAnim.setValue(0);
    }
  }, [isTurn, canRoll, arrowBounceAnim]);

  // Active avatar subtle pulse
  useEffect(() => {
    if (isTurn) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(avatarPulseAnim, {
            toValue: 1.05,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(avatarPulseAnim, {
            toValue: 1.0,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      avatarPulseAnim.setValue(1);
    }
  }, [isTurn, avatarPulseAnim]);

  // Circular timer color transitions (Green -> Amber -> Red)
  const getTimerRingColor = () => {
    if (!isTurn) return pColor.primary;
    if (turnProgress > 0.5) return '#10B981'; // Emerald Green
    if (turnProgress > 0.25) return '#F59E0B'; // Amber Yellow
    return '#EF4444'; // Red (Time running out)
  };

  const strokeDashoffset = isTurn
    ? circumference * (1 - turnProgress)
    : 0;

  // 1. Render Player Profile (Avatar with Circular Timer Ring + Name Plate)
  const renderProfile = () => (
    <View style={styles.profileContainer}>
      {/* Avatar with Circular Progress Ring */}
      <Animated.View
        style={[
          styles.avatarFrame,
          { width: svgSize, height: svgSize },
          isTurn && { transform: [{ scale: avatarPulseAnim }] },
        ]}
      >
        <Svg width={svgSize} height={svgSize} style={styles.svgRing}>
          {/* Background Track */}
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={isTurn ? 'rgba(255, 255, 255, 0.18)' : pColor.primary}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active Depleting Timer Ring */}
          {isTurn && (
            <Circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke={getTimerRingColor()}
              strokeWidth={strokeWidth + 0.5}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
            />
          )}
        </Svg>

        {/* Inner Avatar Disk with Pin Token */}
        <View
          style={[
            styles.avatarInner,
            {
              width: innerAvatarSize,
              height: innerAvatarSize,
              borderRadius: innerAvatarSize / 2,
              backgroundColor: isTurn ? pColor.dark || '#16233B' : '#0B1526',
            },
          ]}
        >
          <PinToken3D token={{ player }} size={pinSize} />
        </View>

        {/* Crown 👑 or Bot 🤖 Mini Badge */}
        {isBot ? (
          <View style={styles.badgeAnchor}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🤖</Text>
            </View>
          </View>
        ) : isYou ? (
          <View style={styles.badgeAnchor}>
            <View style={[styles.roleBadge, styles.youCrownBadge]}>
              <Text style={styles.roleBadgeText}>👑</Text>
            </View>
          </View>
        ) : null}
      </Animated.View>

      {/* Name Plate directly below the avatar */}
      <View
        style={[
          styles.namePlate,
          isTurn && styles.namePlateActive,
          isTurn && { borderColor: '#FACC15' },
        ]}
      >
        <Text
          style={[
            styles.namePlateText,
            isTurn && styles.namePlateTextActive,
          ]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
      </View>
    </View>
  );

  // 2. Render Dedicated 3D Dice Tray (with Downward Bouncing Prompt)
  const renderDice = () => (
    <View style={styles.diceContainer}>
      {/* Animated Bouncing Down-Arrow & "ROLL" Badge */}
      {canRoll && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rollPromptWrap,
            { transform: [{ translateY: arrowBounceAnim }] },
          ]}
        >
          <View style={[styles.rollBadgePill, { backgroundColor: pColor.primary }]}>
            <Text style={styles.rollBadgeText}>ROLL</Text>
          </View>
          <Svg width={12} height={8} viewBox="0 0 12 8">
            <Polygon
              points="6,8 0,0 12,0"
              fill="#FACC15"
              stroke="#78350F"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      )}

      {/* 3D Dice Platform / Podium */}
      <TouchableOpacity
        activeOpacity={canRoll ? 0.75 : 1}
        onPress={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        style={[
          styles.dicePodium,
          {
            width: traySize,
            height: traySize,
          },
          isTurn && canRoll && styles.dicePodiumActive,
        ]}
      >
        <Cube3DFlippingDice
          targetValue={diceValue}
          isRolling={isTurn && isRolling}
          onPress={onRoll}
          disabled={!canRoll}
          size={diceSize}
          themeColor={pColor.primary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.dockRoot}>
      {layout === 'left-badge' ? (
        // Left Side: [ Profile (Avatar + Name) ]  [ Dice Podium ⬇️ ]
        <View style={styles.dockCluster}>
          {renderProfile()}
          {renderDice()}
        </View>
      ) : (
        // Right Side: [ Dice Podium ⬇️ ]  [ Profile (Avatar + Name) ]
        <View style={styles.dockCluster}>
          {renderDice()}
          {renderProfile()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dockRoot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // --- Profile Section ---
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  avatarInner: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeAnchor: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 10,
  },
  roleBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 7,
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  youCrownBadge: {
    backgroundColor: '#D97706',
  },
  roleBadgeText: {
    fontSize: 8,
  },

  // Name Plate Capsule
  namePlate: {
    marginTop: 2,
    backgroundColor: '#0B1526',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  namePlateActive: {
    backgroundColor: '#16233B',
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  },
  namePlateText: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  namePlateTextActive: {
    color: '#FACC15',
    fontWeight: '900',
  },

  // --- Dice Section ---
  diceContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dicePodium: {
    borderRadius: 12,
    backgroundColor: '#070F1D',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  dicePodiumActive: {
    borderColor: '#FACC15',
    backgroundColor: '#0D1A33',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },

  // Downward Bouncing "ROLL" Prompt
  rollPromptWrap: {
    position: 'absolute',
    top: -21,
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 99,
    elevation: 10,
  },
  rollBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: -1,
  },
  rollBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
