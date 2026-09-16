import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { PLAYER_COLORS } from '../../theme/colors';
import Dice3DFallback from '../3d/Dice3DFallback';

export default function DiceStation({
  currentTurn = 'red',
  diceValue = null,
  isRolling = false,
  status = 'ROLLING',
  consecutiveSixes = 0,
  isAiTurn = false,
  onRoll,
  theme,
}) {
  const pColor = PLAYER_COLORS[currentTurn] || PLAYER_COLORS.red;
  const canRoll = !isRolling && status === 'ROLLING' && !isAiTurn;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Left Column: 3D Dice Display (Tap to Roll directly on Dice!) */}
      <TouchableOpacity
        activeOpacity={canRoll ? 0.7 : 1}
        onPress={canRoll ? onRoll : undefined}
        style={styles.diceTouchArea}
      >
        <Dice3DFallback
          targetValue={diceValue || 6}
          isRolling={isRolling}
          onRollComplete={() => {}}
          size={58}
          themeColor={pColor.primary}
          diceBg={theme.diceBg}
        />
      </TouchableOpacity>

      {/* Right Column: Turn Info + Roll Button */}
      <View style={styles.actionColumn}>
        <View style={styles.statusRow}>
          <View style={[styles.turnDot, { backgroundColor: pColor.primary }]} />
          <Text style={[styles.turnLabel, { color: pColor.accent }]}>
            {pColor.name.split(' ')[0]}'s Turn
          </Text>
          {consecutiveSixes > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: pColor.dark }]}>
              <Text style={[styles.streakText, { color: pColor.accent }]}>
                {consecutiveSixes}x 6🔥
              </Text>
            </View>
          )}
        </View>

        {/* Big Tap to Roll Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRoll}
          disabled={!canRoll}
          style={[
            styles.rollBtn,
            {
              backgroundColor: canRoll ? pColor.primary : theme.surfaceElevated,
              borderColor: canRoll ? pColor.accent : theme.border,
              shadowColor: canRoll ? pColor.glow : 'transparent',
            },
          ]}
        >
          <Text style={[styles.rollBtnText, { color: canRoll ? '#FFFFFF' : theme.textMuted }]}>
            {isRolling
              ? '🎲 ROLLING...'
              : isAiTurn
              ? '🤖 AI THINKING...'
              : status === 'WAITING_SELECT'
              ? '👆 TAP YOUR PIN'
              : status === 'NO_MOVES'
              ? 'NO MOVES...'
              : '🎲 TAP TO ROLL'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
    maxHeight: 88,
  },
  diceTouchArea: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  turnLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    flex: 1,
  },
  streakBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  streakText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  rollBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  rollBtnText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
