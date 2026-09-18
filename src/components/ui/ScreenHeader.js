import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BackArrowIcon, CoinIcon, SettingsGearIcon } from './AppIcons';
import { useTheme } from '../../context/ThemeContext';

export default function ScreenHeader({
  title,
  onBack,
  coins,
  onCoinPress,
  rightAction,
  rightIcon,
  onRightPress,
}) {
  const { appTheme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: appTheme.colors.surface,
          borderBottomColor: appTheme.colors.border,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <BackArrowIcon size={24} color={appTheme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={[styles.title, { color: appTheme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {coins !== undefined && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCoinPress}
            style={styles.coinPill}
          >
            <CoinIcon size={18} />
            <Text style={styles.coinText}>{Number(coins).toLocaleString()}</Text>
            <View style={styles.coinPlus}>
              <Text style={styles.coinPlusText}>+</Text>
            </View>
          </TouchableOpacity>
        )}

        {rightIcon === 'settings' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightPress}
            style={styles.rightIconBtn}
          >
            <SettingsGearIcon size={22} color={appTheme.colors.text} />
          </TouchableOpacity>
        )}

        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    gap: 6,
  },
  coinText: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '800',
  },
  coinPlus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinPlusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  rightIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
