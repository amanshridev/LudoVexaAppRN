import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Polygon, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { PLAYER_COLORS } from '../../theme/colors';

export default function CenterHome3D({ size = 70, theme }) {
  const red = PLAYER_COLORS.red;
  const green = PLAYER_COLORS.green;
  const yellow = PLAYER_COLORS.yellow;
  const blue = PLAYER_COLORS.blue;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="redGrad" x1="0%" y1="50%" x2="50%" y2="50%">
            <Stop offset="0%" stopColor={red.dark} />
            <Stop offset="100%" stopColor={red.primary} />
          </LinearGradient>
          <LinearGradient id="greenGrad" x1="50%" y1="0%" x2="50%" y2="50%">
            <Stop offset="0%" stopColor={green.dark} />
            <Stop offset="100%" stopColor={green.primary} />
          </LinearGradient>
          <LinearGradient id="yellowGrad" x1="100%" y1="50%" x2="50%" y2="50%">
            <Stop offset="0%" stopColor={yellow.dark} />
            <Stop offset="100%" stopColor={yellow.primary} />
          </LinearGradient>
          <LinearGradient id="blueGrad" x1="50%" y1="100%" x2="50%" y2="50%">
            <Stop offset="0%" stopColor={blue.dark} />
            <Stop offset="100%" stopColor={blue.primary} />
          </LinearGradient>
        </Defs>

        {/* 4 Colored Victory Triangles meeting at Center (50, 50) */}
        {/* Left: Green */}
        <Polygon points="0,0 50,50 0,100" fill="url(#greenGrad)" />
        {/* Top: Yellow */}
        <Polygon points="0,0 100,0 50,50" fill="url(#yellowGrad)" />
        {/* Right: Blue */}
        <Polygon points="100,0 100,100 50,50" fill="url(#blueGrad)" />
        {/* Bottom: Red */}
        <Polygon points="0,100 100,100 50,50" fill="url(#redGrad)" />

        {/* Center Golden Crown Pedestal */}
        <Circle cx="50" cy="50" r="16" fill="#1E1815" stroke="#D4AF37" strokeWidth="2.5" />
        <Circle cx="50" cy="50" r="11" fill="#D4AF37" opacity="0.85" />
      </Svg>

      <View style={styles.crownOverlay}>
        <Text style={styles.crownText}>👑</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  crownOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownText: {
    fontSize: 14,
  },
});
