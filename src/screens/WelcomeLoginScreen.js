import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LudoVexaLogo } from '../components/ui/AppIcons';

export default function WelcomeLoginScreen({
  onPlayNow,
  onContinueGuest,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071126" />

      {/* Decorative stars */}
      <View style={[styles.starDot, styles.star1]} />
      <View style={[styles.starDot, styles.star2]} />
      <View style={[styles.starDot, styles.star3]} />
      <View style={[styles.starDot, styles.star4]} />

      {/* Top Header Logo Section */}
      <View style={styles.headerSection}>
        <LudoVexaLogo size={270} />
        <Text style={styles.subtitle}>
          Play with Friends{'\n'}or Random Players
        </Text>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.buttonsSection}>
        {/* Play Now Button (Green) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPlayNow}
          style={[styles.btn, styles.playNowBtn]}
        >
          <Text style={styles.btnIcon}>▶</Text>
          <Text style={styles.playNowText}>Play Now</Text>
        </TouchableOpacity>

        {/* Continue as Guest Link */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onContinueGuest || onPlayNow}
          style={styles.guestLink}
        >
          <Text style={styles.guestText}>Continue as Guest</Text>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  starDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#38BDF8',
    opacity: 0.5,
  },
  star1: {
    top: '15%',
    left: '12%',
  },
  star2: {
    top: '25%',
    right: '15%',
  },
  star3: {
    top: '48%',
    left: '18%',
  },
  star4: {
    top: '65%',
    right: '22%',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#CBD5E1',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 18,
  },
  buttonsSection: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  btn: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  playNowBtn: {
    backgroundColor: '#10B981',
  },
  playNowText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  guestText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

