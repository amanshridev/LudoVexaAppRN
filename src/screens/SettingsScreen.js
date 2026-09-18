import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ onNavigate, onBack }) {
  const { appTheme, ludoTheme, settings, themesList } = useTheme();

  const currentAppColorObj = themesList.find((t) => t.id === (settings.appColor || 'emerald')) || themesList[0];

  const sections = [
    {
      title: 'APPEARANCE',
      items: [
        {
          id: 'theme',
          icon: '🎨',
          title: 'Ludo Theme',
          subtitle: ludoTheme?.name || 'Galaxy Space',
          badgeColor: ludoTheme?.colors?.[0] || appTheme.colors.primary,
          route: 'theme',
        },
        {
          id: 'appColor',
          icon: '🌈',
          title: 'App Colors',
          subtitle: currentAppColorObj.name,
          badgeColor: currentAppColorObj.primary,
          route: 'appColor',
        },
      ],
    },
    {
      title: 'PRIVACY & ACCOUNT',
      items: [
        {
          id: 'privacySettings',
          icon: '🔒',
          title: 'Privacy & Safety',
          subtitle: `${settings.profileVisibility ? settings.profileVisibility.toUpperCase() : 'PUBLIC'} Profile`,
          route: 'privacySettings',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="Settings" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Setting Groups */}
        {sections.map((sec, sIdx) => (
          <View key={sec.title || sIdx} style={styles.sectionContainer}>
            <Text style={[styles.sectionHeaderTitle, { color: appTheme.colors.secondaryText }]}>
              {sec.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
              {sec.items.map((item, iIdx) => {
                const isLast = iIdx === sec.items.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.rowItem}
                      onPress={() => onNavigate?.(item.route)}
                    >
                      <View style={styles.rowLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                          <Text style={styles.iconText}>{item.icon}</Text>
                        </View>
                        <View style={styles.textContainer}>
                          <View style={styles.titleBadgeRow}>
                            <Text style={[styles.itemTitle, { color: appTheme.colors.text }]}>{item.title}</Text>
                            {item.badgeColor && (
                              <View style={[styles.colorDot, { backgroundColor: item.badgeColor }]} />
                            )}
                          </View>
                          <Text style={[styles.itemSub, { color: appTheme.colors.secondaryText }]}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rowRight}>
                        <Text style={[styles.arrowIcon, { color: appTheme.colors.primary }]}>→</Text>
                      </View>
                    </TouchableOpacity>
                    {!isLast && <View style={styles.rowDivider} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ))}

        {/* Footer info */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerAppTitle, { color: appTheme.colors.secondaryText }]}>
            LudoVexa App • RN Edition
          </Text>
          <Text style={[styles.footerBuildText, { color: appTheme.colors.mutedText }]}>
            Build 2026.09.16 • All Rights Reserved
          </Text>
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: '900',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  footerAppTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerBuildText: {
    fontSize: 11,
    marginTop: 2,
  },
});
