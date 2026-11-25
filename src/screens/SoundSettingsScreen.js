import React, { useState } from 'react';
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
import { playSound } from '../utils/soundFX';

export default function SoundSettingsScreen({ onBack }) {
  const { appTheme, settings, updateSettings } = useTheme();
  const [testBadge, setTestBadge] = useState(false);

  const handleToggle = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleIntensityChange = (level) => {
    updateSettings({ hapticIntensity: level, haptics: level !== 'off' });
  };

  const handleTestSound = () => {
    playSound('diceRoll');
    setTestBadge(true);
    setTimeout(() => setTestBadge(false), 1200);
  };

  const intensities = [
    { id: 'off', label: 'Off' },
    { id: 'soft', label: 'Soft' },
    { id: 'medium', label: 'Medium' },
    { id: 'strong', label: 'Strong' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Sound & Audio" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Test Sound Card */}
        <View style={[styles.testCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={styles.testLeft}>
            <Text style={[styles.testTitle, { color: appTheme.colors.text }]}>Audio & Haptics Hub</Text>
            <Text style={[styles.testSub, { color: appTheme.colors.secondaryText }]}>
              Test sound effects and vibration feedback in real-time
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTestSound}
            style={[styles.testBtn, { backgroundColor: appTheme.colors.primary }]}
          >
            <Text style={styles.testBtnText}>{testBadge ? '🎵 Playing!' : '🔊 Test FX'}</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Audio Controls */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>MAIN AUDIO</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            {/* Sound FX Toggle */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Sound Effects (SFX)</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Dice rolls, token movement, pawn captures
                </Text>
              </View>
              <Switch
                value={settings.sound ?? true}
                onValueChange={(val) => handleToggle('sound', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Music Toggle */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Background Music</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Lobby theme tune and menu soundtrack
                </Text>
              </View>
              <Switch
                value={settings.music ?? true}
                onValueChange={(val) => handleToggle('music', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 2: Specific Game Sound FX */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>GAMEPLAY FX</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>3D Dice Shake Sound</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Audio feedback during dice rotation
                </Text>
              </View>
              <Switch
                value={settings.diceRollSound ?? true}
                onValueChange={(val) => handleToggle('diceRollSound', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Victory Fanfare</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Triumphant audio when winning a match
                </Text>
              </View>
              <Switch
                value={settings.victorySound ?? true}
                onValueChange={(val) => handleToggle('victorySound', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 3: Haptics & Vibration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>HAPTIC VIBRATION</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Touch & Event Haptics</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Tactile feedback for button taps and dice land
                </Text>
              </View>
              <Switch
                value={settings.haptics ?? true}
                onValueChange={(val) => handleToggle('haptics', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.intensityCol}>
              <Text style={[styles.intensityTitle, { color: appTheme.colors.text }]}>Vibration Intensity</Text>
              <View style={styles.intensityRow}>
                {intensities.map((item) => {
                  const active = (settings.hapticIntensity || 'medium') === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => handleIntensityChange(item.id)}
                      style={[
                        styles.intensityBtn,
                        active && [styles.intensityBtnActive, { backgroundColor: appTheme.colors.primary }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.intensityText,
                          active && styles.intensityTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  testLeft: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  testSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  testBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
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
  },
  intensityCol: {
    paddingVertical: 14,
  },
  intensityTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  intensityBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  intensityText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  intensityTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
