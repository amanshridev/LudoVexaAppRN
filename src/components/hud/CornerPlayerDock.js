import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { EXACT_COLORS } from '../board/LudoBoardExact.js';
import PinToken3D from '../3d/PinToken3D.js';

/**
 * Exact Corner Player Dock with Player Name Tag, Active Turn Glow & Pulsing Indicator
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
  layout = 'left-badge', // 'left-badge' or 'right-badge'
}) {
  const { width: screenWidth } = useWindowDimensions();
  const isSmall = screenWidth < 380;
  const diceSize = isSmall ? 38 : 44;
  const badgeSize = isSmall ? 32 : 36;
  const pinSize = isSmall ? 22 : 26;

  const col = EXACT_COLORS[player] || EXACT_COLORS.red;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Pulsing bounce animation for active turn
  useEffect(() => {
    if (isTurn && !isRolling) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 6,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      arrowAnim.setValue(0);
    }
  }, [isTurn, isRolling, arrowAnim]);

  const renderTokenBadge = () => (
    <View
      style={[
        styles.badgeCircle,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          borderColor: col.goldRing,
        },
      ]}
    >
      <PinToken3D token={{ player }} size={pinSize} />
    </View>
  );

  const renderDiceBox = () => (
    <TouchableOpacity
      activeOpacity={canRoll ? 0.75 : 1}
      onPress={canRoll ? onRoll : undefined}
      style={[
        styles.diceCube,
        {
          width: diceSize,
          height: diceSize,
          backgroundColor: col.base,
          borderColor: isTurn ? '#FACC15' : '#FFFFFF',
        },
        isTurn && styles.activeDiceShadow,
      ]}
    >
      <DiceWhitePips val={diceValue} isSmall={isSmall} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.dockRow}>
      {/* Dark Pill Box with Gold Border */}
      <View style={[styles.pillContainer, isTurn && styles.activePillGlow]}>
        {layout === 'left-badge' ? (
          <>
            {renderTokenBadge()}
            <View style={styles.infoCol}>
              {playerName ? (
                <Text style={[styles.nameTag, isTurn && styles.nameTagActive]} numberOfLines={1}>
                  {playerName}
                </Text>
              ) : null}
              {renderDiceBox()}
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoCol}>
              {playerName ? (
                <Text style={[styles.nameTag, isTurn && styles.nameTagActive]} numberOfLines={1}>
                  {playerName}
                </Text>
              ) : null}
              {renderDiceBox()}
            </View>
            {renderTokenBadge()}
          </>
        )}
      </View>

      {/* Animated Pulsing Arrow pointing to active turn */}
      {isTurn && (
        <Animated.View
          style={[
            styles.arrowWrap,
            layout === 'left-badge'
              ? { transform: [{ translateX: arrowAnim }] }
              : { transform: [{ translateX: Animated.multiply(arrowAnim, -1) }] },
          ]}
        >
          <Text style={styles.yellowArrowText}>
            {layout === 'left-badge' ? '◀' : '▶'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function DiceWhitePips({ val = 6, isSmall = false }) {
  const pipSize = isSmall ? 6 : 7.5;
  const Pip = () => (
    <View
      style={[
        styles.whitePip,
        {
          width: pipSize,
          height: pipSize,
          borderRadius: pipSize / 2,
        },
      ]}
    />
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
          <View style={{ alignSelf: 'flex-start' }}><Pip /></View>
          <View style={{ alignSelf: 'flex-end' }}><Pip /></View>
        </View>
      );
    case 3:
      return (
        <View style={styles.diagonalThree}>
          <View style={{ alignSelf: 'flex-start' }}><Pip /></View>
          <View style={{ alignSelf: 'center' }}><Pip /></View>
          <View style={{ alignSelf: 'flex-end' }}><Pip /></View>
        </View>
      );
    case 4:
      return (
        <View style={styles.gridFour}>
          <View style={styles.pipRow}><Pip /><Pip /></View>
          <View style={styles.pipRow}><Pip /><Pip /></View>
        </View>
      );
    case 5:
      return (
        <View style={styles.gridFive}>
          <View style={styles.pipRow}><Pip /><Pip /></View>
          <View style={{ alignSelf: 'center' }}><Pip /></View>
          <View style={styles.pipRow}><Pip /><Pip /></View>
        </View>
      );
    case 6:
    default:
      return (
        <View style={styles.gridSix}>
          <View style={styles.pipCol}><Pip /><Pip /><Pip /></View>
          <View style={styles.pipCol}><Pip /><Pip /><Pip /></View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E36',
    borderWidth: 2,
    borderColor: '#EAB308',
    borderRadius: 14,
    padding: 4,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  activePillGlow: {
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#1E293B',
  },
  badgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1E36',
  },
  badgeInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeStar: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  infoCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  nameTagActive: {
    color: '#FACC15',
  },
  diceCube: {
    width: 44,
    height: 44,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  activeDiceShadow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  whitePip: {
    width: 7.5,
    height: 7.5,
    borderRadius: 3.75,
    backgroundColor: '#FFFFFF',
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
    padding: 3,
  },
  diagonalThree: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 2,
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
  pipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pipCol: {
    justifyContent: 'space-between',
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  yellowArrowText: {
    fontSize: 22,
    color: '#FACC15',
    fontWeight: '900',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
