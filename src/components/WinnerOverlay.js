import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { CloseIcon, BottomNavHomeIcon } from './ui/AppIcons.js';
import { SoundFX } from '../utils/soundFX.js';
import SoundManager from '../utils/SoundManager.js';

const PLAYER_HEX = {
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#EAB308',
  green: '#10B981',
};

const ALL_COLORS = ['red', 'blue', 'yellow', 'green'];

/**
 * 1. Champion Golden Trophy Graphic (matches reference image)
 */
const GoldenTrophyGraphic = ({ size = 114 }) => {
  const height = size * 0.95;
  return (
    <Svg width={size} height={height} viewBox="0 0 120 114" fill="none">
      <Defs>
        <LinearGradient id="trophyGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="30%" stopColor="#FFD54F" />
          <Stop offset="65%" stopColor="#FFA000" />
          <Stop offset="100%" stopColor="#E65100" />
        </LinearGradient>
        <LinearGradient id="handleGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="50%" stopColor="#FFB300" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
        <LinearGradient id="baseGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#D97706" />
          <Stop offset="35%" stopColor="#FFD54F" />
          <Stop offset="70%" stopColor="#FFA000" />
          <Stop offset="100%" stopColor="#B45309" />
        </LinearGradient>
        <LinearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFD54F" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>

      {/* Left Handle */}
      <Path
        d="M36 28 C14 28 10 52 32 68 C37 71 42 68 40 62 C33 55 29 42 38 36 Z"
        fill="url(#handleGrad)"
        stroke="#D97706"
        strokeWidth="1.5"
      />

      {/* Right Handle */}
      <Path
        d="M84 28 C106 28 110 52 88 68 C83 71 78 68 80 62 C87 55 91 42 82 36 Z"
        fill="url(#handleGrad)"
        stroke="#D97706"
        strokeWidth="1.5"
      />

      {/* Cup Body */}
      <Path
        d="M34 22 C34 22 38 70 60 74 C82 70 86 22 86 22 Z"
        fill="url(#trophyGold)"
      />

      {/* Cup Top Lip / Rim */}
      <Path
        d="M34 22 C34 17 86 17 86 22 C86 26 34 26 34 22 Z"
        fill="#FFFDE7"
      />

      {/* Center 5-Point Star on Cup */}
      <Polygon
        points="60,34 63.8,43.2 73.8,43.8 66,50.2 68.8,60 60,54.5 51.2,60 54,50.2 46.2,43.8 56.2,43.2"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Trophy Stem */}
      <Rect x="54" y="73" width="12" height="15" rx="3" fill="url(#stemGrad)" />
      <Circle cx="60" cy="76" r="6" fill="#FFD54F" />

      {/* Pedestal Top Step */}
      <Rect x="44" y="86" width="32" height="6" rx="3" fill="url(#trophyGold)" />

      {/* Pedestal Bottom Base */}
      <Rect
        x="34"
        y="92"
        width="52"
        height="15"
        rx="4"
        fill="url(#baseGrad)"
        stroke="#B45309"
        strokeWidth="1"
      />
      {/* Base Golden Highlight */}
      <Rect x="40" y="94" width="40" height="3" rx="1.5" fill="#FFF9C4" opacity="0.8" />
    </Svg>
  );
};

/**
 * 2. Winner Avatar Golden Crown
 */
const AvatarCrownGraphic = ({ size = 36 }) => {
  const height = size * 0.75;
  return (
    <Svg width={size} height={height} viewBox="0 0 36 27" fill="none">
      <Defs>
        <LinearGradient id="avatarCrownGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="35%" stopColor="#FFD54F" />
          <Stop offset="75%" stopColor="#FFA000" />
          <Stop offset="100%" stopColor="#E65100" />
        </LinearGradient>
      </Defs>
      {/* Base Band */}
      <Rect x="4" y="21" width="28" height="5" rx="2" fill="#B45309" />
      <Rect x="5" y="21" width="26" height="3" rx="1.5" fill="url(#avatarCrownGrad)" />

      {/* Crown Spikes */}
      <Path
        d="M5 21 L7 8 L13 15 L18 4 L23 15 L29 8 L31 21 Z"
        fill="url(#avatarCrownGrad)"
        stroke="#D97706"
        strokeWidth="0.8"
      />

      {/* Jewel Pearls */}
      <Circle cx="7" cy="8" r="2.2" fill="#FFFDE7" stroke="#D97706" strokeWidth="0.6" />
      <Circle cx="18" cy="4" r="2.8" fill="#FFFDE7" stroke="#D97706" strokeWidth="0.6" />
      <Circle cx="29" cy="8" r="2.2" fill="#FFFDE7" stroke="#D97706" strokeWidth="0.6" />
    </Svg>
  );
};

/**
 * 3. User Silhouette for Avatar Centers
 */
const UserSilhouette = ({ size = 26, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
  </Svg>
);

/**
 * 4. Coin Icon Badge for "+500 Coins"
 */
const GoldCoinBadge = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFF9C4" />
        <Stop offset="40%" stopColor="#FFD54F" />
        <Stop offset="80%" stopColor="#FFA000" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="11" fill="url(#coinGrad)" stroke="#FFE082" strokeWidth="1" />
    <Circle cx="12" cy="12" r="8.5" fill="#FFB300" stroke="#D97706" strokeWidth="0.8" />
    {/* Dollar Sign */}
    <Path
      d="M12 6.5v11M14.5 9.5c0-1.2-1-1.7-2.5-1.7-1.4 0-2.3.6-2.3 1.6 0 1.1 1 1.5 2.6 1.8 1.7.3 2.7.9 2.7 2 0 1.2-1 1.8-2.5 1.8-1.5 0-2.5-.7-2.5-1.8"
      stroke="#78350F"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Fallback Error Boundary to ensure game never crashes on winner screen
 */
export class WinnerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('WinnerOverlay error caught by boundary:', error, info);
    try {
      this.props.fallbackOnGameOver?.();
    } catch (e) {
      console.warn('Fallback onGameOver error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorFallbackContainer}>
          <Text style={styles.errorFallbackTitle}>🏆 Match Concluded!</Text>
          <TouchableOpacity
            style={styles.errorFallbackBtn}
            onPress={this.props.onPlayAgain || this.props.fallbackOnGameOver}
            activeOpacity={0.8}
          >
            <Text style={styles.errorFallbackBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

/**
 * Premium Winner Celebration Overlay
 */
function WinnerOverlayComponent({
  visible = true,
  winnerColor = 'red',
  winnerName = 'Player 1',
  isUserWinner = false,
  rankings = [],
  coinsWon = 500,
  onPlayAgain,
  onHome,
  onClose,
  onWinnerSound,
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isMountedRef = useRef(true);
  const hasSkippedRef = useRef(false);
  const safetyTimeoutRef = useRef(null);

  const cardWidth = Math.min(windowWidth * 0.86, 330);

  // Animations
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.75)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const trophyFloat = useRef(new Animated.Value(0)).current;
  const trophyLoopRef = useRef(null);
  const bottomSectionOpacity = useRef(new Animated.Value(0)).current;
  const bottomSectionY = useRef(new Animated.Value(20)).current;

  // Confetti particles
  const confettiPieces = useRef(
    Array.from({ length: 34 }, (_, i) => {
      const palette = [
        '#FFD700',
        '#38BDF8',
        '#EC4899',
        '#FFFFFF',
        '#10B981',
        '#F59E0B',
        '#A855F7',
      ];
      return {
        id: i,
        xPercent: (i / 34) * 94 + (Math.sin(i * 1.5) * 4 + 3),
        delay: (i % 8) * 90 + Math.floor(Math.sin(i * 2) * 40),
        duration: 2300 + (i % 6) * 200,
        color: palette[i % palette.length],
        width: 6 + (i % 3) * 2,
        height: 10 + (i % 4) * 3,
        isRound: i % 4 === 0,
        rotateDeg: (i * 47) % 360,
        swayRange: (i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 6),
        progress: new Animated.Value(0),
      };
    })
  ).current;

  const [showConfetti, setShowConfetti] = useState(true);

  // Process 4-player ranking list for display
  const displayPlayers = useMemo(() => {
    if (Array.isArray(rankings) && rankings.length > 0) {
      // If we have rankings from GameScreen, make sure we have up to 4
      return rankings.slice(0, 4).map((item, idx) => {
        const itemColor = typeof item === 'object' ? item.color : ALL_COLORS[idx % 4];
        const rawName = typeof item === 'object' ? item.name : String(item);
        const isWinner = typeof item === 'object' ? (item.isWinner || idx === 0) : idx === 0;
        const isUser = typeof item === 'object' ? (item.isUser || item.isUserWinner) : false;

        let displayName = rawName;
        if (isWinner && (isUserWinner || isUser)) {
          displayName = 'You';
        }

        return {
          rank: idx + 1,
          color: itemColor,
          name: displayName,
          isWinner,
        };
      });
    }

    // Default fallback: 4 players
    const winnerDisplay = isUserWinner ? 'You' : winnerName;
    const remainingColors = ALL_COLORS.filter((c) => c !== winnerColor);

    return [
      {
        rank: 1,
        color: winnerColor,
        name: winnerDisplay,
        isWinner: true,
      },
      {
        rank: 2,
        color: remainingColors[0] || 'blue',
        name: 'Computer 4',
        isWinner: false,
      },
      {
        rank: 3,
        color: remainingColors[1] || 'yellow',
        name: 'Computer 3',
        isWinner: false,
      },
      {
        rank: 4,
        color: remainingColors[2] || 'green',
        name: 'Computer 2',
        isWinner: false,
      },
    ];
  }, [rankings, winnerColor, winnerName, isUserWinner]);

  // Skip animation to end
  const skipToEnd = useCallback(() => {
    if (hasSkippedRef.current) {
      return;
    }
    hasSkippedRef.current = true;
    bgOpacity.setValue(0.85);
    cardScale.setValue(1);
    cardOpacity.setValue(1);
    bottomSectionOpacity.setValue(1);
    bottomSectionY.setValue(0);
  }, [bgOpacity, cardScale, cardOpacity, bottomSectionOpacity, bottomSectionY]);

  // Entrance animations
  useEffect(() => {
    if (!visible) {
      return;
    }
    isMountedRef.current = true;
    hasSkippedRef.current = false;

    // Victory sound
    try {
      SoundFX.victory();
    } catch (soundErr) {
      console.warn('WinnerOverlay SoundFX.victory error:', soundErr);
    }
    if (typeof onWinnerSound === 'function') {
      try {
        onWinnerSound();
      } catch (hookErr) {
        console.warn('onWinnerSound hook error:', hookErr);
      }
    }

    // 1. Dark background fade
    Animated.timing(bgOpacity, {
      toValue: 0.88,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    // 2. Card spring
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 65,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Floating Trophy Loop
    trophyLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(trophyFloat, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(trophyFloat, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    trophyLoopRef.current.start();

    // 4. Confetti fall
    const confettiAnimations = confettiPieces.map((p) =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(p.progress, {
          toValue: 1,
          duration: p.duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(confettiAnimations).start();

    const confettiTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setShowConfetti(false);
      }
    }, 4500);

    // 5. Bottom Section (Avatars & Play Again) entrance
    Animated.sequence([
      Animated.delay(280),
      Animated.parallel([
        Animated.timing(bottomSectionOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomSectionY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    safetyTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && !hasSkippedRef.current) {
        skipToEnd();
      }
    }, 2500);

    return () => {
      isMountedRef.current = false;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      clearTimeout(confettiTimer);
      bgOpacity.stopAnimation();
      cardScale.stopAnimation();
      cardOpacity.stopAnimation();
      trophyFloat.stopAnimation();
      if (trophyLoopRef.current) {
        trophyLoopRef.current.stop();
      }
      bottomSectionOpacity.stopAnimation();
      bottomSectionY.stopAnimation();
      confettiPieces.forEach((p) => p.progress.stopAnimation());
    };
  }, [
    visible,
    bgOpacity,
    cardScale,
    cardOpacity,
    trophyFloat,
    bottomSectionOpacity,
    bottomSectionY,
    confettiPieces,
    onWinnerSound,
    skipToEnd,
  ]);

  const handleClosePress = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    if (trophyLoopRef.current) {
      trophyLoopRef.current.stop();
    }
    try {
      SoundManager.play('buttonTap');
      SoundFX.button();
    } catch (_) {}
    if (typeof onClose === 'function') {
      onClose();
    } else {
      onHome?.();
    }
  }, [onClose, onHome]);

  const handlePlayAgainPress = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    if (trophyLoopRef.current) {
      trophyLoopRef.current.stop();
    }
    try {
      SoundManager.play('buttonTap');
      SoundFX.button();
    } catch (_) {}
    onPlayAgain?.();
  }, [onPlayAgain]);

  const handleHomePress = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    if (trophyLoopRef.current) {
      trophyLoopRef.current.stop();
    }
    try {
      SoundManager.play('buttonTap');
      SoundFX.button();
    } catch (_) {}
    onHome?.();
  }, [onHome]);

  const headerTitle = isUserWinner ? 'YOU WIN!' : `${winnerName.toUpperCase()} WINS!`;
  const headerSubtitle = 'All 4 tokens reached home';

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* 1. Backdrop */}
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={() => {
          if (!hasSkippedRef.current) {
            skipToEnd();
          } else {
            handleClosePress();
          }
        }}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: bgOpacity,
            },
          ]}
        />
      </Pressable>

      {/* 2. Confetti Particles */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {showConfetti &&
          confettiPieces.map((p) => {
            const translateY = p.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, windowHeight + 30],
            });
            const translateX = p.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, p.swayRange, -p.swayRange * 0.5],
            });
            const rotate = p.progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${p.rotateDeg + 360}deg`],
            });
            const opacity = p.progress.interpolate({
              inputRange: [0, 0.08, 0.85, 1],
              outputRange: [0, 1, 0.9, 0],
            });

            return (
              <Animated.View
                key={`confetti_${p.id}`}
                style={[
                  styles.confettiItem,
                  {
                    left: `${p.xPercent}%`,
                    width: p.width,
                    height: p.height,
                    backgroundColor: p.color,
                    borderRadius: p.isRound ? p.width / 2 : 2,
                    opacity,
                    transform: [{ translateY }, { translateX }, { rotate }],
                  },
                ]}
              />
            );
          })}
      </View>

      {/* Top Close Button (✕) */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={handleClosePress}
        activeOpacity={0.7}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        accessibilityRole="button"
        accessibilityLabel="Close Winner Screen"
      >
        <CloseIcon size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 3. Main Center Content Container */}
      <View style={styles.centerContainer} pointerEvents="box-none">
        {/* Top Winner Card */}
        <Animated.View
          style={[
            styles.cardBox,
            {
              width: cardWidth,
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Champion Trophy with gentle float */}
          <Animated.View
            style={[
              styles.trophyWrapper,
              {
                transform: [{ translateY: trophyFloat }],
              },
            ]}
          >
            <GoldenTrophyGraphic size={118} />
          </Animated.View>

          {/* YOU WIN! Title */}
          <Text style={styles.winnerText}>{headerTitle}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitleText}>{headerSubtitle}</Text>

          {/* Coins Reward Pill */}
          <View style={styles.rewardPill}>
            <GoldCoinBadge size={22} />
            <Text style={styles.rewardText}>+{coinsWon || 500} Coins</Text>
          </View>
        </Animated.View>

        {/* Bottom Section: Avatars Podium Row + Play Again Button */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              width: '100%',
              opacity: bottomSectionOpacity,
              transform: [{ translateY: bottomSectionY }],
            },
          ]}
        >
          {/* 4 Players Horizontal Row */}
          <View style={styles.playersRow}>
            {displayPlayers.map((player) => {
              const pColor = PLAYER_HEX[player.color] || player.color || '#3B82F6';
              const isWinner = player.isWinner;

              return (
                <View key={`player_rank_${player.rank}`} style={styles.playerColumn}>
                  {/* Avatar wrapper */}
                  <View style={styles.avatarWrap}>
                    {/* Golden Crown on top of winner */}
                    {isWinner && (
                      <View style={styles.crownContainer}>
                        <AvatarCrownGraphic size={36} />
                      </View>
                    )}

                    {/* Circular Avatar */}
                    <View
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: pColor,
                          borderColor: isWinner ? '#FFC107' : 'rgba(255, 255, 255, 0.45)',
                          borderWidth: isWinner ? 3.5 : 2.5,
                        },
                      ]}
                    >
                      <UserSilhouette size={isWinner ? 28 : 24} color="#FFFFFF" />
                    </View>

                    {/* Rank Badge in bottom-right corner */}
                    <View
                      style={[
                        styles.rankBadge,
                        {
                          backgroundColor: isWinner ? '#FBBF24' : '#1E293B',
                          borderColor: isWinner ? '#B45309' : 'rgba(255, 255, 255, 0.3)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankBadgeText,
                          {
                            color: isWinner ? '#451A03' : '#FFFFFF',
                          },
                        ]}
                      >
                        {player.rank}
                      </Text>
                    </View>
                  </View>

                  {/* Player Label */}
                  <Text
                    style={[
                      styles.playerNameText,
                      isWinner ? styles.winnerPlayerNameText : styles.normalPlayerNameText,
                    ]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Big Golden PLAY AGAIN Button */}
          <TouchableOpacity
            style={styles.playAgainBtn}
            onPress={handlePlayAgainPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Play Again"
          >
            {/* Golden Gradient Background using SVG */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="playBtnGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FFE066" />
                    <Stop offset="30%" stopColor="#FFC107" />
                    <Stop offset="80%" stopColor="#FFA000" />
                    <Stop offset="100%" stopColor="#F57C00" />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="27"
                  fill="url(#playBtnGrad)"
                />
              </Svg>
            </View>

            <Text style={styles.playAgainText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          {/* Secondary Exit / Home Option */}
          <TouchableOpacity
            style={styles.homeLinkBtn}
            onPress={handleHomePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <BottomNavHomeIcon size={16} color="#94A3B8" />
            <Text style={styles.homeLinkText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

export default React.memo(WinnerOverlayComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F122B',
  },
  confettiItem: {
    position: 'absolute',
    top: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: 36,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  cardBox: {
    backgroundColor: '#272260',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  trophyWrapper: {
    marginTop: -4,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerText: {
    color: '#FFB800',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(245, 158, 11, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleText: {
    color: '#C7D2FE',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 14,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191544',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bottomSection: {
    marginTop: 28,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  playerColumn: {
    alignItems: 'center',
    width: 72,
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownContainer: {
    position: 'absolute',
    top: -21,
    alignSelf: 'center',
    zIndex: 10,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 19,
    height: 19,
    borderRadius: 9.5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  playerNameText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
  },
  winnerPlayerNameText: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 13,
  },
  normalPlayerNameText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  playAgainBtn: {
    width: '88%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  playAgainText: {
    color: '#3B1C00',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  homeLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  homeLinkText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  errorFallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 7, 18, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  errorFallbackTitle: {
    color: '#FDE047',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorFallbackBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minHeight: 48,
  },
  errorFallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
