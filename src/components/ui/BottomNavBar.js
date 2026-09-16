import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  BottomNavHomeIcon,
  BottomNavTrophyIcon,
  BottomNavFriendsIcon,
  BottomNavProfileIcon,
} from './AppIcons';

export default function BottomNavBar({ currentTab = 'home', onSelectTab }) {
  const tabs = [
    { key: 'home', label: 'Home', renderIcon: (col) => <BottomNavHomeIcon size={20} color={col} /> },
    { key: 'tournaments', label: 'Tournaments', renderIcon: (col) => <BottomNavTrophyIcon size={20} color={col} /> },
    { key: 'friends', label: 'Friends', renderIcon: (col) => <BottomNavFriendsIcon size={20} color={col} /> },
    { key: 'profile', label: 'Profile', renderIcon: (col) => <BottomNavProfileIcon size={20} color={col} /> },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        const iconColor = isActive ? '#38BDF8' : '#94A3B8';

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onSelectTab(tab.key)}
            style={styles.tabItem}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              {tab.renderIcon(iconColor)}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0F1D38',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(56, 189, 248, 0.15)',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  icon: {
    fontSize: 18,
    opacity: 0.65,
  },
  activeIcon: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  activeLabel: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    marginTop: 3,
  },
});
