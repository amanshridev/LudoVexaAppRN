import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function EventTicker({ message, theme }) {
  if (!message) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={styles.tickerIcon}>⚡</Text>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.tickerText, { color: theme.textPrimary }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tickerIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
});
