import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { PLAYER_COLORS } from '../../theme/colors';

export default function PlayerBanner({
  player,
  isCurrentTurn = false,
  isWinner = false,
  tokens = [],
  captures = 0,
  isAI = false,
  theme,
  compact = false,
}) {
  const pColor = PLAYER_COLORS[player] || PLAYER_COLORS.red;

  const baseCount = tokens.filter((t) => t.step === -1).length;
  const homeCount = tokens.filter((t) => t.isHome).length;
  const trackCount = 4 - baseCount - homeCount;

  if (compact) {
    return (
      <View
        style={[
          styles.compactCard,
          {
            backgroundColor: theme.surface,
            borderColor: isCurrentTurn ? pColor.primary : theme.border,
            shadowColor: isCurrentTurn ? pColor.glow : 'transparent',
          },
          isCurrentTurn && styles.activeCompactCard,
        ]}
      >
        <View
          style={[
            styles.compactAvatar,
            {
              backgroundColor: pColor.dark,
              borderColor: isCurrentTurn ? pColor.accent : pColor.secondary,
            },
          ]}
        >
          <Text style={styles.compactAvatarIcon}>
            {isWinner ? '👑' : pColor.icon}
          </Text>
        </View>

        <View style={styles.compactInfo}>
          <Text
            numberOfLines={1}
            style={[
              styles.compactName,
              { color: isCurrentTurn ? pColor.accent : theme.textPrimary },
            ]}
          >
            {pColor.name.split(' ')[0]} {isAI ? '🤖' : ''}
          </Text>
          <Text style={[styles.compactTokens, { color: theme.textSecondary }]}>
            🏠{homeCount} 🏃{trackCount}
          </Text>
        </View>

        {isCurrentTurn && (
          <View style={[styles.compactTurnDot, { backgroundColor: pColor.primary }]} />
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isCurrentTurn ? pColor.primary : theme.border,
          shadowColor: isCurrentTurn ? pColor.glow : 'transparent',
        },
        isCurrentTurn && styles.activeCard,
      ]}
    >
      {/* Player Avatar with Glow */}
      <View
        style={[
          styles.avatarRing,
          {
            backgroundColor: pColor.dark,
            borderColor: isCurrentTurn ? pColor.accent : pColor.secondary,
          },
        ]}
      >
        <Text style={styles.avatarIcon}>
          {isWinner ? '👑' : pColor.icon}
        </Text>
      </View>

      {/* Info Column */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={[styles.playerName, { color: theme.textPrimary }]}>
            {pColor.name.split(' ')[0]} {isAI ? '🤖' : ''}
          </Text>
          {isCurrentTurn && (
            <View style={[styles.turnPill, { backgroundColor: pColor.primary }]}>
              <Text style={styles.turnPillText}>TURN</Text>
            </View>
          )}
        </View>

        {/* Token Progress Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.miniBadge, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              🏃 {trackCount}
            </Text>
          </View>
          <View style={[styles.miniBadge, { backgroundColor: pColor.dark }]}>
            <Text style={[styles.badgeText, { color: pColor.light }]}>
              🏆 {homeCount}/4
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 120,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  activeCard: {
    borderWidth: 2,
  },
  avatarRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarIcon: {
    fontSize: 16,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '800',
  },
  turnPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  turnPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  // Compact mode styles for single-screen HUD
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 105,
    minWidth: 85,
  },
  activeCompactCard: {
    borderWidth: 1.5,
  },
  compactAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  compactAvatarIcon: {
    fontSize: 11,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 10,
    fontWeight: '800',
  },
  compactTokens: {
    fontSize: 8.5,
    fontWeight: '600',
  },
  compactTurnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 3,
  },
});
