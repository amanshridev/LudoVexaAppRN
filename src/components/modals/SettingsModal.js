import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { THEMES } from '../../theme/colors';

export default function SettingsModal({
  visible,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}) {
  if (!visible) return null;

  const currentThemeId = settings.theme || 'rajwada';
  const soundEnabled = settings.sound !== undefined ? settings.sound : true;

  const handleThemeSelect = (themeKey) => {
    onUpdateSettings({ ...settings, theme: themeKey });
  };

  const handleSoundToggle = (val) => {
    onUpdateSettings({ ...settings, sound: val });
  };

  const handleAiDifficulty = (diff) => {
    onUpdateSettings({ ...settings, aiDifficulty: diff });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              GAME SETTINGS
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 1. Theme Selection */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            BOARD & 3D THEME
          </Text>
          <View style={styles.themeGrid}>
            {Object.keys(THEMES).map((key) => {
              const th = THEMES[key];
              const isSelected = currentThemeId === key;
              return (
                <TouchableOpacity
                  key={`th_${key}`}
                  activeOpacity={0.8}
                  onPress={() => handleThemeSelect(key)}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: isSelected ? theme.surfaceElevated : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.themeIcon}>{th.icon}</Text>
                  <Text
                    style={[
                      styles.themeName,
                      { color: isSelected ? theme.accent : theme.textPrimary },
                    ]}
                  >
                    {th.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. Audio Toggle */}
          <View style={[styles.settingRow, { borderColor: theme.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Sound Effects & 3D Audio
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Dice rolling clatter, pin hops & capture blasts
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              thumbColor={soundEnabled ? theme.accent : '#94A3B8'}
              trackColor={{ false: '#334155', true: theme.surfaceElevated }}
            />
          </View>

          {/* 3. AI Difficulty */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 16 }]}>
            AI DIFFICULTY
          </Text>
          <View style={styles.diffRow}>
            {['easy', 'medium', 'hard'].map((diff) => {
              const isSelected = (settings.aiDifficulty || 'medium') === diff;
              return (
                <TouchableOpacity
                  key={`diff_${diff}`}
                  activeOpacity={0.8}
                  onPress={() => handleAiDifficulty(diff)}
                  style={[
                    styles.diffBtn,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.surfaceElevated,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.diffText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {diff.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  themeCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  diffText: {
    fontSize: 12,
    fontWeight: '800',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
