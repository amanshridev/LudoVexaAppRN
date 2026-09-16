import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { PLAYER_COLORS } from '../../theme/colors';

export default function VictoryModal({
  visible,
  winners = [],
  onRematch,
  onExitHome,
  theme,
}) {
  if (!visible || winners.length === 0) return null;

  const firstPlace = winners[0];
  const pColor = PLAYER_COLORS[firstPlace] || PLAYER_COLORS.red;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: pColor.primary }]}>
          {/* Trophy Header */}
          <View style={[styles.trophyHalo, { backgroundColor: pColor.dark, borderColor: pColor.accent }]}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>

          <Text style={[styles.victoryTitle, { color: pColor.accent }]}>
            VICTORY!
          </Text>

          <Text style={[styles.winnerName, { color: theme.textPrimary }]}>
            {pColor.name} Wins!
          </Text>

          <Text style={[styles.congratsText, { color: theme.textSecondary }]}>
            Master of the 3D Ludo Arena
          </Text>

          {/* Podium Rankings */}
          <View style={[styles.podiumBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Text style={[styles.podiumHeader, { color: theme.textSecondary }]}>
              FINAL RANKINGS
            </Text>
            {winners.map((p, idx) => {
              const col = PLAYER_COLORS[p];
              return (
                <View key={`rank_${p}`} style={styles.rankRow}>
                  <Text style={styles.rankMedal}>
                    {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : '🥉 3rd'}
                  </Text>
                  <Text style={[styles.rankPlayer, { color: col.accent }]}>
                    {col.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Trophy Bonus Pill */}
          <View style={[styles.trophyBonus, { backgroundColor: pColor.dark, borderColor: pColor.primary }]}>
            <Text style={styles.trophyBonusText}>+25 Trophies Earned ⭐</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonCol}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRematch}
              style={[styles.actionBtn, { backgroundColor: pColor.primary, borderColor: pColor.accent }]}
            >
              <Text style={styles.actionBtnText}>🔄 REMATCH</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onExitHome}
              style={[styles.actionBtnSecondary, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
            >
              <Text style={[styles.actionBtnSecText, { color: theme.textPrimary }]}>
                🏠 MAIN MENU
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  trophyHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  trophyIcon: {
    fontSize: 36,
  },
  victoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  congratsText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  podiumBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  podiumHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rankMedal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  rankPlayer: {
    fontSize: 13,
    fontWeight: '800',
  },
  trophyBonus: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 18,
  },
  trophyBonusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FDE68A',
  },
  buttonCol: {
    width: '100%',
    gap: 10,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  actionBtnSecondary: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
