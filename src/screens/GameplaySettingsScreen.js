import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';

export default function GameplaySettingsScreen({ onBack }) {
  const { appTheme, settings, updateSettings } = useTheme();

  const handleToggle = (key, val) => {
    updateSettings({ [key]: val });
  };

  const handleSelect = (key, val) => {
    updateSettings({ [key]: val });
  };

  const aiDifficulties = [
    { id: 'easy', label: 'Easy 🌱' },
    { id: 'medium', label: 'Medium ⚔️' },
    { id: 'hard', label: 'Hard ⚡' },
  ];

  const gameModes = [
    { id: 'power', label: 'Power Ludo ⚡', desc: 'Cards & Power-ups' },
    { id: 'classic', label: 'Classic 👑', desc: 'Standard Rules' },
    { id: 'rush', label: 'Rush 🚀', desc: 'Fast-paced Blitz' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Gameplay Settings" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: AI Difficulty */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>AI BOT DIFFICULTY</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <Text style={styles.cardHeaderDesc}>
              Select default intelligence level for AI opponents in Offline & vs Bot modes.
            </Text>
            <View style={styles.pillRow}>
              {aiDifficulties.map((item) => {
                const active = (settings.aiDifficulty || 'medium') === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelect('aiDifficulty', item.id)}
                    style={[
                      styles.pillBtn,
                      active && [styles.pillBtnActive, { backgroundColor: appTheme.colors.primary }],
                    ]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section 2: Default Game Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>PREFERRED GAME MODE</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.modeCol}>
              {gameModes.map((mode, idx) => {
                const active = (settings.gameMode || 'power') === mode.id;
                const isLast = idx === gameModes.length - 1;
                return (
                  <React.Fragment key={mode.id}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect('gameMode', mode.id)}
                      style={styles.modeRow}
                    >
                      <View style={styles.modeTextCol}>
                        <Text style={styles.modeLabel}>{mode.label}</Text>
                        <Text style={[styles.modeDesc, { color: appTheme.colors.secondaryText }]}>
                          {mode.desc}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          active && [styles.radioCircleActive, { borderColor: appTheme.colors.primary }],
                        ]}
                      >
                        {active && (
                          <View style={[styles.radioInner, { backgroundColor: appTheme.colors.primary }]} />
                        )}
                      </View>
                    </TouchableOpacity>
                    {!isLast && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section 3: Game Mechanics & Speed */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>MECHANICS & ASSISTANCE</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            {/* Auto Roll */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Auto-Roll Dice</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Automatically roll dice when turn starts
                </Text>
              </View>
              <Switch
                value={settings.autoRoll ?? false}
                onValueChange={(val) => handleToggle('autoRoll', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Turbo Mode */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Turbo Mode (Fast Animations)</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Double token movement speed on board
                </Text>
              </View>
              <Switch
                value={settings.turboMode ?? false}
                onValueChange={(val) => handleToggle('turboMode', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Show Safe Spots */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Highlight Safe Star Spots</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Glow indicator on safe star tiles
                </Text>
              </View>
              <Switch
                value={settings.showSafeSpots ?? true}
                onValueChange={(val) => handleToggle('showSafeSpots', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Show Movement Hints */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Token Path Hints</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Show step destination preview on tap
                </Text>
              </View>
              <Switch
                value={settings.showMovementHints ?? true}
                onValueChange={(val) => handleToggle('showMovementHints', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 4: Player Count */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>DEFAULT PLAYERS</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.pillRow}>
              {[2, 4].map((count) => {
                const active = (settings.playerCount || 4) === count;
                return (
                  <TouchableOpacity
                    key={count}
                    activeOpacity={0.8}
                    onPress={() => handleSelect('playerCount', count)}
                    style={[
                      styles.pillBtn,
                      active && [styles.pillBtnActive, { backgroundColor: appTheme.colors.primary }],
                    ]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {count} Players {count === 4 ? '👥👥' : '👥'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeaderDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  pillBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modeCol: {
    gap: 4,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modeTextCol: {
    flex: 1,
  },
  modeLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#38BDF8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
});
