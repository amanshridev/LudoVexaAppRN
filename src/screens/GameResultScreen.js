import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CrownIcon, CoinIcon } from '../components/ui/AppIcons';

export default function GameResultScreen({
  winner = 'red',
  coinsWon = 200,
  opponent = 'Player 3',
  onPlayAgain,
  onHome,
}) {
  const isUserWinner = winner === 'red';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071126" />

      {/* Decorative stars */}
      <View style={[styles.starDot, { top: '15%', left: '15%' }]} />
      <View style={[styles.starDot, { top: '25%', right: '18%' }]} />
      <View style={[styles.starDot, { top: '40%', left: '12%' }]} />
      <View style={[styles.starDot, { top: '65%', right: '14%' }]} />

      <View style={styles.centerCard}>
        {/* Crown */}
        <View style={styles.crownBox}>
          <CrownIcon size={56} />
        </View>

        {/* Title */}
        <Text style={styles.resultTitle}>
          {isUserWinner ? 'You Won!' : 'Game Over'}
        </Text>

        {/* Coins Badge */}
        {isUserWinner && (
          <View style={styles.coinRewardPill}>
            <CoinIcon size={22} />
            <Text style={styles.coinRewardText}>+{coinsWon} Coins</Text>
          </View>
        )}

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {isUserWinner ? `You defeated ${opponent}` : `${opponent} won the match!`}
        </Text>

        {/* Winner celebration avatar */}
        <View style={styles.winnerAvatarBox}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>
              {isUserWinner ? '👑' : '🥈'}
            </Text>
          </View>
          <Text style={styles.avatarLabel}>
            {isUserWinner ? 'Champion' : 'Runner Up'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Play Again (Gold) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPlayAgain}
          style={styles.playAgainBtn}
        >
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>

        {/* Home (Blue) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onHome}
          style={styles.homeBtn}
        >
          <Text style={styles.homeText}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071126',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  starDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#38BDF8',
    opacity: 0.5,
  },
  centerCard: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    gap: 12,
  },
  crownBox: {
    marginBottom: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: 1.5,
    textShadowColor: '#B45309',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  coinRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 2,
    borderColor: '#EAB308',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginVertical: 4,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  coinRewardText: {
    color: '#FDE047',
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  winnerAvatarBox: {
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F1D38',
    borderWidth: 3,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  avatarLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  playAgainBtn: {
    height: 52,
    backgroundColor: '#EAB308',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CA8A04',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playAgainText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  homeBtn: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  homeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
