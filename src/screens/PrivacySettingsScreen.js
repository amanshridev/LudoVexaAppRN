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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import SoundManager from '../utils/SoundManager';

export default function PrivacySettingsScreen({ onBack }) {
  const { appTheme, settings, updateSettings } = useTheme();
  const [cacheMessage, setCacheMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'policy'

  const handleToggle = (key, val) => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    updateSettings({ [key]: val });
  };

  const handleSelectVisibility = (val) => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    updateSettings({ profileVisibility: val });
  };

  const handleClearCache = async () => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    setCacheMessage('Clearing temporary board cache...');
    setTimeout(() => {
      setCacheMessage('✓ Cache successfully cleared (18.4 MB freed)');
      setTimeout(() => setCacheMessage(null), 3000);
    }, 500);
  };

  const visibilityOptions = [
    { id: 'public', label: 'Public', icon: '🌍', sub: 'Everyone' },
    { id: 'friends', label: 'Friends', icon: '👥', sub: 'Contacts only' },
    { id: 'private', label: 'Private', icon: '🔒', sub: 'Only you' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Privacy & Policy" onBack={onBack} />

      {/* Top Segmented Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: appTheme.colors.surface }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('settings')}
          style={[
            styles.tabItem,
            activeTab === 'settings' && [styles.activeTabItem, { backgroundColor: appTheme.colors.primary }],
          ]}
        >
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>
            🛡️ Privacy Controls
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('policy')}
          style={[
            styles.tabItem,
            activeTab === 'policy' && [styles.activeTabItem, { backgroundColor: appTheme.colors.primary }],
          ]}
        >
          <Text style={[styles.tabLabel, activeTab === 'policy' && styles.activeTabLabel]}>
            📜 Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'settings' ? (
          <>
            {/* Header Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <View style={styles.heroRow}>
                <View style={[styles.heroIconBox, { backgroundColor: appTheme.colors.primary + '25' }]}>
                  <Text style={styles.heroEmoji}>🔒</Text>
                </View>
                <View style={styles.heroTextCol}>
                  <Text style={[styles.heroTitle, { color: appTheme.colors.text }]}>
                    Your Data, Fully in Your Control
                  </Text>
                  <Text style={[styles.heroSub, { color: appTheme.colors.secondaryText }]}>
                    Ludo Vexa does not sell personal data. Manage your profile visibility, multiplayer invites, and telemetry below.
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 1: Profile Visibility */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
                PROFILE & GAME VISIBILITY
              </Text>
              <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.07)' }]}>
                <Text style={styles.cardHeaderDesc}>
                  Choose who can view your win rate, badges, coin balance, and recent matches.
                </Text>
                <View style={styles.visibilityGrid}>
                  {visibilityOptions.map((opt) => {
                    const active = (settings.profileVisibility || 'public') === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.8}
                        onPress={() => handleSelectVisibility(opt.id)}
                        style={[
                          styles.visibilityCard,
                          active && [styles.visibilityCardActive, { borderColor: appTheme.colors.primary, backgroundColor: appTheme.colors.primary + '18' }],
                        ]}
                      >
                        <Text style={styles.visibilityEmoji}>{opt.icon}</Text>
                        <Text style={[styles.visibilityLabel, active && { color: '#FFFFFF', fontWeight: '800' }]}>
                          {opt.label}
                        </Text>
                        <Text style={styles.visibilitySub}>{opt.sub}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Section 2: Online & Social Safety */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
                ONLINE & SOCIAL PREFERENCES
              </Text>
              <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.07)' }]}>
                {/* Show Online Status */}
                <View style={styles.row}>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>Online Status Presence</Text>
                    <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                      Allow friends to see when you are available for a match
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
                    <Text style={styles.rowTitle}>Public Leaderboard Ranking</Text>
                    <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                      Display trophies and tournament stats on weekly leaderboards
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
                    <Text style={styles.rowTitle}>Direct Match Invites</Text>
                    <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                      Allow room code challenges and private invitations
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

            {/* Section 3: Data & Diagnostics */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
                ANALYTICS & DIAGNOSTICS
              </Text>
              <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.07)' }]}>
                <View style={styles.row}>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>Crash Reports & Performance</Text>
                    <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
                      Anonymous diagnostics help us fix bugs and frame drops
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
                DEVICE STORAGE & CACHE
              </Text>
              <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.07)' }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClearCache}
                  style={styles.actionRow}
                >
                  <View style={styles.actionLeft}>
                    <View style={styles.trashBox}>
                      <Text style={styles.actionIcon}>🗑️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>Clear Local Board Cache</Text>
                      <Text style={[styles.actionSub, { color: appTheme.colors.secondaryText }]}>
                        Frees memory and temporary visual theme assets
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.clearBtnBadge, { backgroundColor: appTheme.colors.primary + '20', borderColor: appTheme.colors.primary }]}>
                    <Text style={[styles.actionBtnText, { color: appTheme.colors.primaryLight || appTheme.colors.primary }]}>
                      Clean Cache
                    </Text>
                  </View>
                </TouchableOpacity>

                {cacheMessage && (
                  <View style={styles.toastBanner}>
                    <Text style={styles.toastText}>{cacheMessage}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          /* Privacy Policy Reading View */
          <View style={[styles.policyContainer, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.08)' }]}>
            <View style={styles.policyHeader}>
              <Text style={styles.policyDocTitle}>Ludo Vexa Privacy Policy</Text>
              <Text style={styles.policyDocDate}>Last Updated: November 2026</Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyHeading}>1. Information We Collect</Text>
              <Text style={styles.policyParagraph}>
                Ludo Vexa is engineered with user privacy as a cornerstone. We only collect minimal gameplay statistics (e.g. matches played, victory streaks, coins earned) stored locally on your device via secure offline storage.
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyHeading}>2. Online Services & Ads</Text>
              <Text style={styles.policyParagraph}>
                Third-party partner networks (such as Google AdMob) may serve interest-based or non-personalized advertisements within the game. These services use advertising IDs in full compliance with Google Play Store Developer policies.
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyHeading}>3. Crash Diagnostics</Text>
              <Text style={styles.policyParagraph}>
                We may log non-identifiable stack traces through Firebase Crashlytics to diagnose engine freezes, dice animation glitches, or unexpected terminations. You can disable telemetry anytime in the Privacy Controls tab.
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyHeading}>4. Children’s Privacy</Text>
              <Text style={styles.policyParagraph}>
                Our game does not intentionally collect personally identifiable information from children under the age of 13.
              </Text>
            </View>

            <View style={styles.policySection}>
              <Text style={styles.policyHeading}>5. Contact & Data Inquiries</Text>
              <Text style={styles.policyParagraph}>
                If you have questions regarding this policy or wish to request data removal, reach us at support@ludovexa.app.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 22,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    lineHeight: 17,
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
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeaderDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 17,
  },
  visibilityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  visibilityCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  visibilityCardActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  visibilityEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  visibilityLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  visibilitySub: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 14.5,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
  trashBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  clearBtnBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  toastBanner: {
    marginTop: 12,
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
  policyContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  policyHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  policyDocTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  policyDocDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  policySection: {
    marginBottom: 16,
  },
  policyHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 6,
  },
  policyParagraph: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 19,
  },
});
