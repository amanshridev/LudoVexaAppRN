import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PLAYER_COLORS } from '../../theme/colors.js';

export default function ModeSelectModal({
  visible,
  onClose,
  onStartGame,
  theme,
}) {
  const [playerCount, setPlayerCount] = useState(4); // 2 | 3 | 4
  const [gameMode, setGameMode] = useState('power'); // 'power' | 'classic'
  const [overallType, setOverallType] = useState('bots'); // 'bots' | 'pass' | 'custom'

  // Individual slot types
  const [playerTypes, setPlayerTypes] = useState({
    red: 'human',
    green: 'bot',
    yellow: 'bot',
    blue: 'bot',
  });

  if (!visible) return null;

  const handleSelectOverallType = (type) => {
    setOverallType(type);
    if (type === 'bots') {
      setPlayerTypes({
        red: 'human',
        green: 'bot',
        yellow: 'bot',
        blue: 'bot',
      });
    } else if (type === 'pass') {
      setPlayerTypes({
        red: 'human',
        green: 'human',
        yellow: 'human',
        blue: 'human',
      });
    }
  };

  const toggleSlotType = (player) => {
    setOverallType('custom');
    setPlayerTypes((prev) => ({
      ...prev,
      [player]: prev[player] === 'human' ? 'bot' : 'human',
    }));
  };

  const handleLaunch = () => {
    const isVsAi = Object.values(playerTypes).some((t) => t === 'bot');
    onStartGame({
      playerCount,
      gameMode,
      isVsAi,
      playerTypes,
    });
  };

  // Determine active slots
  const activeSlots = playerCount === 2 ? ['red', 'yellow'] : playerCount === 3 ? ['red', 'green', 'yellow'] : ['red', 'green', 'yellow', 'blue'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.titleIcon}>🎲</Text>
              <Text style={styles.titleText}>SETUP MATCH</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* STEP 1: HOW MANY PLAYERS */}
            <Text style={styles.sectionHeading}>1. HOW MANY PLAYERS?</Text>
            <View style={styles.optionRow}>
              {[2, 3, 4].map((count) => {
                const isSelected = playerCount === count;
                return (
                  <TouchableOpacity
                    key={`count_${count}`}
                    activeOpacity={0.8}
                    onPress={() => setPlayerCount(count)}
                    style={[
                      styles.playerCountBtn,
                      {
                        backgroundColor: isSelected ? '#EF4444' : '#1E293B',
                        borderColor: isSelected ? '#F87171' : '#334155',
                      },
                    ]}
                  >
                    <Text style={styles.playerCountNum}>{count}</Text>
                    <Text style={[styles.playerCountLabel, { color: isSelected ? '#FFFFFF' : '#94A3B8' }]}>
                      PLAYERS
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* STEP 2: REAL PLAYERS OR BOTS */}
            <Text style={[styles.sectionHeading, { marginTop: 18 }]}>
              2. REAL PLAYERS OR PLAY WITH BOTS?
            </Text>

            {/* Quick Presets */}
            <View style={styles.quickPresetRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectOverallType('bots')}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: overallType === 'bots' ? '#10B981' : '#1E293B',
                    borderColor: overallType === 'bots' ? '#34D399' : '#334155',
                  },
                ]}
              >
                <Text style={styles.presetIcon}>🤖</Text>
                <Text style={[styles.presetText, { color: overallType === 'bots' ? '#FFFFFF' : '#94A3B8' }]}>
                  Play with Bots
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelectOverallType('pass')}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: overallType === 'pass' ? '#3B82F6' : '#1E293B',
                    borderColor: overallType === 'pass' ? '#60A5FA' : '#334155',
                  },
                ]}
              >
                <Text style={styles.presetIcon}>👥</Text>
                <Text style={[styles.presetText, { color: overallType === 'pass' ? '#FFFFFF' : '#94A3B8' }]}>
                  All Real Players
                </Text>
              </TouchableOpacity>
            </View>

            {/* Individual Slot Customization */}
            <Text style={styles.slotSubtitle}>Configure each player slot:</Text>
            <View style={styles.slotsList}>
              {activeSlots.map((player, idx) => {
                const pColor = PLAYER_COLORS[player];
                const isHuman = playerTypes[player] === 'human';

                return (
                  <View
                    key={`slot_${player}`}
                    style={[styles.slotCard, { borderColor: pColor.secondary }]}
                  >
                    <View style={styles.slotInfo}>
                      <View style={[styles.slotBadge, { backgroundColor: pColor.dark, borderColor: pColor.primary }]}>
                        <Text style={styles.slotIcon}>{pColor.icon}</Text>
                      </View>
                      <View>
                        <Text style={[styles.slotPlayerName, { color: pColor.accent }]}>
                          {pColor.name} {idx === 0 ? '(You)' : ''}
                        </Text>
                        <Text style={styles.slotRoleText}>
                          {isHuman ? '👤 Real Player' : '🤖 Smart Bot'}
                        </Text>
                      </View>
                    </View>

                    {/* Toggle Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleSlotType(player)}
                      style={[
                        styles.typeToggleBtn,
                        {
                          backgroundColor: isHuman ? '#3B82F6' : '#10B981',
                          borderColor: isHuman ? '#60A5FA' : '#34D399',
                        },
                      ]}
                    >
                      <Text style={styles.typeToggleText}>
                        {isHuman ? '👤 Real' : '🤖 Bot'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* STEP 3: GAME MODE */}
            <Text style={[styles.sectionHeading, { marginTop: 18 }]}>3. GAME MODE</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setGameMode('power')}
                style={[
                  styles.modeOption,
                  {
                    backgroundColor: gameMode === 'power' ? '#1E293B' : '#0F172A',
                    borderColor: gameMode === 'power' ? '#F59E0B' : '#334155',
                  },
                ]}
              >
                <Text style={styles.modeIcon}>⚡</Text>
                <Text style={[styles.modeTitle, { color: gameMode === 'power' ? '#F59E0B' : '#F8FAFC' }]}>
                  Power Blitz
                </Text>
                <Text style={styles.modeSub}>Boosts, shields & warps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setGameMode('classic')}
                style={[
                  styles.modeOption,
                  {
                    backgroundColor: gameMode === 'classic' ? '#1E293B' : '#0F172A',
                    borderColor: gameMode === 'classic' ? '#F59E0B' : '#334155',
                  },
                ]}
              >
                <Text style={styles.modeIcon}>👑</Text>
                <Text style={[styles.modeTitle, { color: gameMode === 'classic' ? '#F59E0B' : '#F8FAFC' }]}>
                  Classic Royal
                </Text>
                <Text style={styles.modeSub}>Traditional rules</Text>
              </TouchableOpacity>
            </View>

            {/* START GAME BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLaunch}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>▶ START GAME NOW</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    fontSize: 22,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94A3B8',
  },
  scroll: {
    paddingBottom: 30,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playerCountBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCountNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  playerCountLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  quickPresetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  presetIcon: {
    fontSize: 16,
  },
  presetText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  slotSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  slotsList: {
    gap: 6,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIcon: {
    fontSize: 16,
  },
  slotPlayerName: {
    fontSize: 13,
    fontWeight: '800',
  },
  slotRoleText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  typeToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  typeToggleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  modeSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  startBtn: {
    marginTop: 22,
    backgroundColor: '#DC2626',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
