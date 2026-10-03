import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { PLAYER_COLORS } from '../../theme/colors.js';
import PinToken3D from '../3d/PinToken3D.js';
import Cube3DFlippingDice from '../3d/Cube3DFlippingDice.js';

/**
 * Authentic Ludo King Style Corner Player Dock:
 * 1. Classic Square Avatar Box with metallic border & player color trim
 * 2. Name Ribbon directly attached below the avatar box
 * 3. Dedicated Square 3D Dice Platform with gold border
 * 4. Animated Bouncing Green Pointer Arrow (⬇️ ROLL) pointing down into dice
 * 5. Integrated turn countdown timer bar at the bottom of the avatar box
 * 6. Symmetric layout (Dice on the side facing board center)
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
  layout = 'left-badge', // 'left-badge': [Avatar+Name] [Dice], 'right-badge': [Dice] [Avatar+Name]
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 380;

  // Responsive dimensions
  const boxSize = isSmall ? 42 : 46;
  const pinSize = isSmall ? 20 : 23;
  const diceSize = isSmall ? 32 : 36;
  const ribbonWidth = isSmall ? 48 : 54;

  const pColor = PLAYER_COLORS[player] || PLAYER_COLORS.red;
  const isYou = playerName === 'You';
  const displayName = isYou ? 'You' : playerName || player.toUpperCase();

  // Animation values
  const arrowBounceAnim = useRef(new Animated.Value(0)).current;
  const avatarPulseAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  // 1. Downward arrow bouncy animation when player can roll
  useEffect(() => {
    if (isTurn && canRoll) {
      const arrowLoop = Animated.loop(
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
      arrowLoop.start();
      return () => arrowLoop.stop();
    } else {
      arrowBounceAnim.setValue(0);
    }
  }, [isTurn, canRoll, arrowBounceAnim]);

  // 2. Active avatar subtle scale pulse
  useEffect(() => {
    if (isTurn) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(avatarPulseAnim, {
            toValue: 1.04,
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
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      avatarPulseAnim.setValue(1);
    }
  }, [isTurn, avatarPulseAnim]);

  // 3. 15-second Turn Timer countdown
  useEffect(() => {
    if (isTurn) {
      timerAnim.setValue(1);
      const timerAnimation = Animated.timing(timerAnim, {
        toValue: 0,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      timerAnimation.start();
      return () => timerAnimation.stop();
    } else {
      timerAnim.setValue(1);
    }
  }, [isTurn, timerAnim]);

  // Section 1: Ludo King Classic Profile (Avatar Box + Name Ribbon)
  const renderProfile = () => (
    <View style={styles.profileCol}>
      {/* Square Avatar Box */}
      <Animated.View
        style={[
          styles.avatarSquare,
          {
            width: boxSize,
            height: boxSize,
            borderColor: isTurn ? '#FACC15' : pColor.primary,
            transform: [{ scale: avatarPulseAnim }],
          },
          isTurn && {
            shadowColor: '#FACC15',
            shadowOpacity: 0.9,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        {/* Inner background */}
        <View
          style={[
            styles.avatarInner,
            { backgroundColor: isTurn ? pColor.dark || '#16233B' : '#0B1526' },
          ]}
        >
          <PinToken3D token={{ player }} size={pinSize} />
        </View>

        {/* Role Badge (👑 Crown for You, 🤖 Bot for Computer) */}
        {isBot ? (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>🤖</Text>
          </View>
        ) : isYou ? (
          <View style={[styles.roleBadge, styles.crownBadge]}>
            <Text style={styles.roleBadgeText}>👑</Text>
          </View>
        ) : null}

        {/* Turn Countdown Timer Bar at bottom edge of avatar box */}
        {isTurn && (
          <View style={styles.timerTrack}>
            <Animated.View
              style={[
                styles.timerFill,
                {
                  width: timerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: timerAnim.interpolate({
                    inputRange: [0, 0.25, 0.5, 1],
                    outputRange: ['#EF4444', '#F59E0B', '#10B981', '#10B981'],
                  }),
                },
              ]}
            />
          </View>
        )}
      </Animated.View>

      {/* Name Ribbon directly below avatar box */}
      <View
        style={[
          styles.nameRibbon,
          { width: ribbonWidth },
          isTurn && styles.nameRibbonActive,
        ]}
      >
        <Text
          style={[
            styles.nameText,
            isTurn && styles.nameTextActive,
          ]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
      </View>
    </View>
  );

  // Section 2: Ludo King Classic Dice Platform (Roller Pad + Down Arrow)
  const renderDice = () => (
    <View style={styles.diceCol}>
      {/* Downward Bouncing "ROLL" Pointer Arrow */}
      {canRoll && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.arrowPromptWrap,
            { transform: [{ translateY: arrowBounceAnim }] },
          ]}
        >
          <View style={styles.rollBadgePill}>
            <Text style={styles.rollBadgeText}>ROLL</Text>
          </View>
          <Svg width={14} height={9} viewBox="0 0 14 9">
            <Polygon
              points="7,9 0,0 14,0"
              fill="#10B981"
              stroke="#064E3B"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      )}

      {/* Square 3D Dice Platform */}
      <TouchableOpacity
        activeOpacity={canRoll ? 0.75 : 1}
        onPress={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        style={[
          styles.dicePlatform,
          {
            width: boxSize,
            height: boxSize,
            borderColor: isTurn && canRoll ? '#FACC15' : 'rgba(255, 255, 255, 0.18)',
          },
          isTurn && canRoll && styles.dicePlatformActive,
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

      {/* Spacer matching name ribbon height so baseline remains perfectly level */}
      <View style={styles.diceBottomSpacer} />
    </View>
  );

  return (
    <View style={styles.dockRoot}>
      {layout === 'left-badge' ? (
        // Left Player: [ Profile (Avatar + Name) ]  [ Dice Platform ⬇️ ]
        <View style={styles.dockRow}>
          {renderProfile()}
          {renderDice()}
        </View>
      ) : (
        // Right Player: [ Dice Platform ⬇️ ]  [ Profile (Avatar + Name) ]
        <View style={styles.dockRow}>
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
  dockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  // --- Profile Column (Avatar Box + Name Ribbon) ---
  profileCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Square Avatar Box (Ludo King Iconic Frame)
  avatarSquare: {
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1322',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Role Badge (Top-Right of avatar box)
  roleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#1E293B',
    borderRadius: 7,
    paddingHorizontal: 2.5,
    paddingVertical: 0.5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 4,
    zIndex: 10,
  },
  crownBadge: {
    backgroundColor: '#D97706',
  },
  roleBadgeText: {
    fontSize: 7.5,
  },

  // Turn Countdown Timer Bar (Flush with bottom of Avatar Box)
  timerTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timerFill: {
    height: '100%',
  },

  // Name Ribbon Plate (Directly attached under Avatar Box)
  nameRibbon: {
    marginTop: 3,
    backgroundColor: '#0B1526',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 7,
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2,
  },
  nameRibbonActive: {
    backgroundColor: '#16233B',
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  },
  nameText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  nameTextActive: {
    color: '#FACC15',
    fontWeight: '900',
  },

  // --- Dice Column (Roller Platform + Downward Arrow) ---
  diceCol: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Square 3D Dice Platform
  dicePlatform: {
    borderRadius: 10,
    backgroundColor: '#070F1C',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  dicePlatformActive: {
    backgroundColor: '#0D1A33',
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },

  // Downward Bouncing "ROLL" Arrow Prompt
  arrowPromptWrap: {
    position: 'absolute',
    top: -21,
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 99,
    elevation: 10,
  },
  rollBadgePill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
    marginBottom: -1,
  },
  rollBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Bottom Spacer matching name ribbon height (maintains perfect level alignment)
  diceBottomSpacer: {
    height: 18,
  },
});
