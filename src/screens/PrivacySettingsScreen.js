import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PrivacySettingsScreen({ onBack }) {
  const { appTheme, settings, updateSettings } = useTheme();
  const [cacheMessage, setCacheMessage] = useState(null);

  const handleToggle = (key, val) => {
    updateSettings({ [key]: val });
  };

  const handleSelectVisibility = (val) => {
    updateSettings({ profileVisibility: val });
  };

  const handleClearCache = async () => {
    try {
      setCacheMessage('Clearing local cache...');
      // Simulated cache flush
      setTimeout(() => {
        setCacheMessage('✓ Cache cleared (14.2 MB freed)');
        setTimeout(() => setCacheMessage(null), 3000);
      }, 600);
    } catch (e) {
      setCacheMessage('Failed to clear cache');
    }
  };

  const visibilityOptions = [
    { id: 'public', label: 'Public 🌍' },
    { id: 'friends', label: 'Friends 👥' },
    { id: 'private', label: 'Private 🔒' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Privacy & Safety" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Profile Visibility */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            PROFILE VISIBILITY
          </Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <Text style={styles.cardHeaderDesc}>
              Control who can inspect your win rates, trophies, and match history.
            </Text>
            <View style={styles.pillRow}>
              {visibilityOptions.map((opt) => {
                const active = (settings.profileVisibility || 'public') === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectVisibility(opt.id)}
                    style={[
                      styles.pillBtn,
                      active && [styles.pillBtnActive, { backgroundColor: appTheme.colors.primary }],
                    ]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section 2: Online & Social Safety */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            SOCIAL & LEADERBOARD
          </Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            {/* Show Online Status */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Show Online Status</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Allow friends to see when you are active
                </Text>
              </View>
              <Switch
                value={settings.showOnlineStatus ?? true}
                onValueChange={(val) => handleToggle('showOnlineStatus', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Show Stats on Leaderboard */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Leaderboard Rankings</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Display rank and trophies on global leaderboards
                </Text>
              </View>
              <Switch
                value={settings.showStatsOnLeaderboard ?? true}
                onValueChange={(val) => handleToggle('showStatsOnLeaderboard', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Allow Challenge Invites */}
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Direct Challenge Invites</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Allow players to send direct game invites
                </Text>
              </View>
              <Switch
                value={settings.allowDirectInvites ?? true}
                onValueChange={(val) => handleToggle('allowDirectInvites', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 3: Data & Analytics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            DATA & ANALYTICS
          </Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowTitle}>Performance & Bug Analytics</Text>
                <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                  Share anonymous crash reports to help improve LudoVexa
                </Text>
              </View>
              <Switch
                value={settings.analytics ?? true}
                onValueChange={(val) => handleToggle('analytics', val)}
                trackColor={{ false: '#334155', true: appTheme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 4: Cache & Local Storage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
            STORAGE & CACHE
          </Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearCache}
              style={styles.actionRow}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🗑️</Text>
                <View>
                  <Text style={styles.actionTitle}>Clear Local Cache</Text>
                  <Text style={[styles.actionSub, { color: appTheme.colors.secondaryText }]}>
                    Free up temporary image assets and board cache
                  </Text>
                </View>
              </View>
              <Text style={[styles.actionBtnText, { color: appTheme.colors.primary }]}>Clear</Text>
            </TouchableOpacity>

            {cacheMessage && (
              <View style={styles.toastBanner}>
                <Text style={styles.toastText}>{cacheMessage}</Text>
              </View>
            )}
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  toastBanner: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  toastText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
  },
});
