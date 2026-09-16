import React, { useRef, useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Easing,
} from 'react-native';

const FACE_ROTATIONS = {
  1: { x: '0deg', y: '0deg' },
  2: { x: '-90deg', y: '0deg' },
  3: { x: '0deg', y: '-90deg' },
  4: { x: '0deg', y: '90deg' },
  5: { x: '90deg', y: '0deg' },
  6: { x: '180deg', y: '0deg' },
};

export default function Dice3DFallback({
  targetValue = 6,
  isRolling = false,
  onRollComplete,
  size = 80,
  themeColor = '#D4AF37',
  diceBg = '#1E293B',
}) {
  const rotX = useRef(new Animated.Value(0)).current;
  const rotY = useRef(new Animated.Value(0)).current;
  const rotZ = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRolling) {
      // 3D Multi-axis physics roll animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -size * 0.7,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 450,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(shadowScale, {
            toValue: 0.6,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(shadowScale, {
            toValue: 1.0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotX, {
          toValue: 1080 + getBaseAngleX(targetValue),
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotY, {
          toValue: 1440 + getBaseAngleY(targetValue),
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotZ, {
          toValue: 720,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onRollComplete) onRollComplete(targetValue);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling, targetValue]);

  function getBaseAngleX(val) {
    switch (val) {
      case 2: return -90;
      case 5: return 90;
      case 6: return 180;
      default: return 0;
    }
  }

  function getBaseAngleY(val) {
    switch (val) {
      case 3: return -90;
      case 4: return 90;
      default: return 0;
    }
  }

  const rotXStr = rotX.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
  });
  const rotYStr = rotY.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
  });
  const rotZStr = rotZ.interpolate({
    inputRange: [0, 3600],
    outputRange: ['0deg', '3600deg'],
  });

  return (
    <View style={[styles.wrapper, { width: size, height: size * 1.3 }]}>
      {/* Dynamic 3D floor shadow */}
      <Animated.View
        style={[
          styles.floorShadow,
          {
            width: size * 0.85,
            height: size * 0.25,
            bottom: size * 0.05,
            transform: [{ scale: shadowScale }],
          },
        ]}
      />

      {/* 3D Rolling Cube Body */}
      <Animated.View
        style={[
          styles.cube,
          {
            width: size,
            height: size,
            transform: [
              { perspective: 800 },
              { translateY },
              { rotateX: rotXStr },
              { rotateY: rotYStr },
              { rotateZ: rotZStr },
            ],
          },
        ]}
      >
        <FaceDisplay
          value={targetValue}
          size={size}
          themeColor={themeColor}
          diceBg={diceBg}
        />
      </Animated.View>
    </View>
  );
}

function FaceDisplay({ value, size, themeColor, diceBg }) {
  const pipSize = size * 0.18;
  const pips = [];

  const pipStyle = [
    styles.pip,
    {
      width: pipSize,
      height: pipSize,
      borderRadius: pipSize / 2,
      backgroundColor: themeColor,
      shadowColor: themeColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
      elevation: 3,
    },
  ];

  // Draw 1..6 pips
  const renderPips = () => {
    switch (value) {
      case 1:
        return <View style={styles.center}>{pips[0] || <View style={pipStyle} />}</View>;
      case 2:
        return (
          <View style={styles.twoPips}>
            <View style={[pipStyle, { alignSelf: 'flex-start' }]} />
            <View style={[pipStyle, { alignSelf: 'flex-end' }]} />
          </View>
        );
      case 3:
        return (
          <View style={styles.threePips}>
            <View style={[pipStyle, { alignSelf: 'flex-start' }]} />
            <View style={[pipStyle, { alignSelf: 'center' }]} />
            <View style={[pipStyle, { alignSelf: 'flex-end' }]} />
          </View>
        );
      case 4:
        return (
          <View style={styles.fourPips}>
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.fourPips}>
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
            <View style={[pipStyle, { alignSelf: 'center' }]} />
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
          </View>
        );
      case 6:
      default:
        return (
          <View style={styles.fourPips}>
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
            <View style={styles.row}>
              <View style={pipStyle} />
              <View style={pipStyle} />
            </View>
          </View>
        );
    }
  };

  return (
    <View
      style={[
        styles.faceContainer,
        {
          width: size,
          height: size,
          backgroundColor: diceBg,
          borderColor: themeColor,
        },
      ]}
    >
      <View style={styles.innerGlow}>{renderPips()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floorShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 30,
  },
  cube: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceContainer: {
    borderRadius: 18,
    borderWidth: 3,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  innerGlow: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    padding: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoPips: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 4,
  },
  threePips: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 2,
  },
  fourPips: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pip: {},
});
