import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CrownIcon,
  FriendsIcon,
  RobotIcon,
  SettingsGearIcon,
} from '../components/ui/AppIcons';
import { useTheme } from '../context/ThemeContext';

export default function WelcomeLoginScreen({
  onPlayNow,
  onContinueGuest,
  onOpenSettings,
}) {
  const { appTheme } = useTheme();

  // Mode: 'ai' | 'local'
  const [selectedMode, setSelectedMode] = useState('ai');
  // Player Count: 2 | 3 | 4
  const [playerCount, setPlayerCount] = useState(4);
  // User Pawn Color: 'red' | 'green' | 'yellow' | 'blue'
  const [userColor, setUserColor] = useState('red');

  const modes = [
    { id: 'ai', title: 'VS AI', sub: 'Offline bot' },
    { id: 'local', title: 'Pass & Play', sub: 'With friends' },
  ];

  const playerCounts = [
    { count: 2, label: '2 Players' },
    { count: 3, label: '3 Players' },
    { count: 4, label: '4 Players' },
  ];

  const colors = [
    { id: 'red', name: 'Red', hex: '#EF4444' },
    { id: 'green', name: 'Green', hex: '#10B981' },
    { id: 'yellow', name: 'Yellow', hex: '#F59E0B' },
    { id: 'blue', name: 'Blue', hex: '#3B82F6' },
  ];

  const handleStartGame = () => {
    const options = {
      playerCount,
      isVsAi: selectedMode === 'ai',
      userColor,
      gameMode: 'classic',
    };
    onPlayNow?.(options);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />

      {/* Decorative stars */}
      <View style={[styles.starDot, styles.star1, { backgroundColor: appTheme.colors.primaryLight }]} />
 
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with Title & Settings Gear Shortcut */}
        <View style={styles.headerRow}>
          <View style={styles.headerBadge}>
            <CrownIcon size={25} />
            <Text style={[styles.appHeaderTitle, { color: appTheme.colors.text }]}>
             Ludo Game
            </Text>
          </View>
          {/* <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenSettings}
            style={[styles.settingsBtn, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SettingsGearIcon size={20} color={appTheme.colors.text} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.intro}>
          <Text style={[styles.introTitle, { color: appTheme.colors.text }]}>Ready to roll?</Text>
          <Text style={[styles.introSubtitle, { color: appTheme.colors.secondaryText }]}>Set up your next Ludo match.</Text>
        </View>

        {/* Section 1: Game Mode Selection */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            GAME MODE
          </Text>
          <View style={[styles.modeRow ,
          {
  marginBottom: 11,
  marginTop: 5,
 
           } ]}>
            {modes.map((m) =>   {
              const active = selectedMode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedMode(m.id)}
                  style={[
                    styles.modeCard,
                    { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.08)' },
                    active && [styles.modeCardActive, { borderColor: appTheme.colors.primary, backgroundColor: appTheme.colors.primary + '22' }],
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.modeIconBg, { backgroundColor: active ? appTheme.colors.primary : 'rgba(255,255,255,0.06)' }]}>
                    {m.id === 'ai' ? (
                      <RobotIcon size={23} color={active ? '#FFFFFF' : appTheme.colors.secondaryText} />
                    ) : (
                      <FriendsIcon size={23} color={active ? '#FFFFFF' : appTheme.colors.secondaryText} />
                    )}
                  </View>
                  <Text style={[styles.modeTitle, { color: appTheme.colors.text }]}>
                    {m.title}
                  </Text>
                  <Text style={[styles.modeSub, { color: appTheme.colors.secondaryText }]}>
                    {m.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 2: Player Count Selection (2, 3, 4, 5) */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText, marginBottom: 11 }]}>
            PLAYERS COUNT
          </Text>
          <View style={[styles.pillsRow, { marginBottom: 10 }]}>
            {playerCounts.map((item) => {
              const active = playerCount === item.count;
              return (
                <TouchableOpacity
                  key={item.count}
                  activeOpacity={0.8}
                  onPress={() => setPlayerCount(item.count)}
                  style={[
                    styles.pillBtn,
                    { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.08)' },
                    active && [styles.pillBtnActive, { backgroundColor: appTheme.colors.primary }],
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {item.count}P
                  </Text>
                  <Text style={[styles.pillSubText, active ? { color: '#FFFFFF' } : { color: appTheme.colors.secondaryText }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Pawn Color Selection */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            YOUR PAWN COLOR
          </Text>
          <View style={styles.colorsRow}>
            {colors.map((c) => {
              const active = userColor === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.8}
                  onPress={() => setUserColor(c.id)}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: appTheme.colors.surface },
                    active && [styles.colorBtnActive, { borderColor: c.hex, backgroundColor: c.hex + '18' }],
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${c.name} pawn color`}
                >
                  <View style={[styles.colorDot, { backgroundColor: c.hex }]} />
                  <Text style={[styles.colorName, { color: appTheme.colors.text }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Action Button */}
       
      
      </ScrollView>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStartGame}
            style={[
              styles.playBtn,
              { backgroundColor: appTheme.colors.primary, shadowColor: appTheme.colors.primary,
                marginBottom:15,
                marginHorizontal:15
              },
            ]}
          >
            <Text style={styles.playBtnText}>PLAY NOW</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  starDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  star1: { top: '6%', left: '8%' },
  star2: { top: '18%', right: '10%' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
   },
  appHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: {
    marginTop: 18,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '900',
  },
  introSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom:15,
    marginLeft: 2,
   },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
   },
  modeCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  modeCardActive: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modeIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  modeSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    borderWidth: 0,
    elevation: 3,
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '900',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  pillSubText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  colorBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  colorName: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionContainer: {
    marginTop: 22,
    marginBottom: 10,
  },
  playBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  playBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

