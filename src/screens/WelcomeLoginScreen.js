import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LudoVexaLogo } from '../components/ui/AppIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLOR_INFO = {
  red: { hex: '#EF4444', emoji: '🔴', name: 'Red' },
  green: { hex: '#10B981', emoji: '🟢', name: 'Green' },
  yellow: { hex: '#EAB308', emoji: '🟡', name: 'Yellow' },
  blue: { hex: '#3B82F6', emoji: '🔵', name: 'Blue' },
};

export default function WelcomeLoginScreen({
  onPlayNow,
  onContinueGuest,
}) {
  const [playerCount, setPlayerCount] = useState(4); // 2, 3, or 4
  const [isVsAi, setIsVsAi] = useState(true); // true = vs Computer, false = vs Friends (Pass & Play)
  const [userColor, setUserColor] = useState('red'); // 'red', 'green', 'yellow', 'blue'

  const handleSelectCount = (count) => {
    setPlayerCount(count);
  };

  const handleStart = (guest = false) => {
    const options = {
      playerCount,
      isVsAi,
      userColor,
      gameMode: 'classic',
    };
    if (guest && onContinueGuest) {
      onContinueGuest(options);
    } else if (onPlayNow) {
      onPlayNow(options);
    }
  };

  // Get active color preview badges
  const renderPlayerBadges = () => {
    const ALL_COLORS = ['red', 'green', 'yellow', 'blue'];
    let activeColors = [];
    if (playerCount === 2) {
      const OPPOSITE = { red: 'yellow', yellow: 'red', green: 'blue', blue: 'green' };
      activeColors = [userColor, OPPOSITE[userColor] || 'yellow'];
    } else if (playerCount === 3) {
      const start = ALL_COLORS.indexOf(userColor);
      const validStart = start >= 0 ? start : 0;
      activeColors = [
        ALL_COLORS[validStart],
        ALL_COLORS[(validStart + 1) % 4],
        ALL_COLORS[(validStart + 2) % 4],
      ];
    } else {
      activeColors = ALL_COLORS;
    }

    let botCounter = 1;
    let playerCounter = 2;
    const list = activeColors.map((col) => {
      const isUser = col === userColor;
      let label = `${COLOR_INFO[col].emoji} You`;
      if (!isUser) {
        if (isVsAi) {
          label = `${COLOR_INFO[col].emoji} Bot ${botCounter++}`;
        } else {
          label = `${COLOR_INFO[col].emoji} Player ${playerCounter++}`;
        }
      }

      return { color: COLOR_INFO[col].hex, label };
    });

    return (
      <View style={styles.previewBadgesRow}>
        {list.map((item, idx) => (
          <View key={idx} style={[styles.badgeChip, { borderColor: item.color }]}>
            <View style={[styles.badgeDot, { backgroundColor: item.color }]} />
            <Text style={styles.badgeText}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071126" />



      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Logo Section */}
        <View style={styles.headerSection}>
          <LudoVexaLogo size={220} />
          <Text style={styles.subtitle}>
            Game Setup & Options
          </Text>
        </View>

        {/* Setup Card */}
        <View style={styles.cardSection}>
          {/* Game Mode Selector */}
          <Text style={styles.sectionTitle}>🎮 CHOOSE GAME MODE</Text>
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsVsAi(true)}
              style={[
                styles.modeTab,
                isVsAi && styles.modeTabActive,
              ]}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={[styles.modeTabText, isVsAi && styles.modeTabTextActive]}>
                vs Computer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsVsAi(false)}
              style={[
                styles.modeTab,
                !isVsAi && styles.modeTabActive,
              ]}
            >
              <Text style={styles.modeIcon}>👥</Text>
              <Text style={[styles.modeTabText, !isVsAi && styles.modeTabTextActive]}>
                vs Friends
              </Text>
            </TouchableOpacity>
          </View>

          {/* Color Picker Section */}
          <Text style={styles.sectionSubTitle}>🎨 PICK YOUR COLOR</Text>
          <View style={styles.colorPickerGrid}>
            {[
              { id: 'red', name: 'Red', hex: '#EF4444' },
              { id: 'green', name: 'Green', hex: '#10B981' },
              { id: 'yellow', name: 'Yellow', hex: '#EAB308' },
              { id: 'blue', name: 'Blue', hex: '#3B82F6' },
            ].map((item) => {
              const isSelected = userColor === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setUserColor(item.id)}
                  style={[
                    styles.colorCard,
                    { borderColor: isSelected ? item.hex : '#1E293B' },
                    isSelected && styles.colorCardSelected,
                  ]}
                >
                  <View style={[styles.colorCircle, { backgroundColor: item.hex }]}>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.colorCardText, isSelected && { color: item.hex, fontWeight: '800' }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interactive Player Count Slider Section */}
          <Text style={styles.sectionSubTitle}>
            👥 SELECT PLAYERS ({playerCount} PLAYERS)
          </Text>

          {/* Custom Interactive Slider Track */}
          <View style={styles.sliderBox}>
            <View style={styles.sliderTrackBackground} />

            {/* Slider Step Buttons */}
            <View style={styles.stepsRow}>
              {[2, 3, 4].map((num) => {
                const isActive = playerCount === num;
                return (
                  <TouchableOpacity
                    key={num}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCount(num)}
                    style={[
                      styles.stepCircle,
                      isActive && styles.stepCircleActive,
                    ]}
                  >
                    <Text style={[styles.stepText, isActive && styles.stepTextActive]}>
                      {num}P
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Player Roster Preview */}

        </View>

        {/* Action Buttons Section */}
        <View style={styles.buttonsSection}>
          {/* Play Now Button (Green) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleStart(false)}
            style={[styles.btn, styles.playNowBtn]}
          >
            <Text style={styles.playNowText}>
              PLAY AS ({playerCount}P)
            </Text>
          </TouchableOpacity>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071126',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  starDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#38BDF8',
    opacity: 0.5,
  },
  star1: { top: '10%', left: '12%' },
  star2: { top: '20%', right: '15%' },
  star3: { top: '45%', left: '18%' },
  star4: { top: '65%', right: '22%' },

  headerSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
    marginBlock: 15
  },

  cardSection: {
    backgroundColor: '#0F1E36',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionSubTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },

  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#071126',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  modeIcon: {
    fontSize: 16,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },

  colorPickerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  colorCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#071126',
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 2,
    gap: 4,
  },
  colorCardSelected: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  colorCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  sliderBox: {
    position: 'relative',
    height: 50,
    justifyContent: 'center',
    marginVertical: 2,
  },
  sliderTrackBackground: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#071126',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.1 }],
  },
  stepText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  stepTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  previewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  previewBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071126',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },

  buttonsSection: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    height: 52,
    borderRadius: 26,
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
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  guestText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
