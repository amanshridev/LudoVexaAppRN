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
import { CrownIcon, TrophyIcon, CloseIcon, ReplayIcon, BottomNavHomeIcon } from './ui/AppIcons.js';
import { SoundFX } from '../utils/soundFX.js';
import SoundManager from '../utils/SoundManager.js';

const PLAYER_HEX = {
  red: '#EF4444',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6',
};

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '🏅'];

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
  coinsWon = 200,
  onPlayAgain,
  onHome,
  onClose,
  onWinnerSound,
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isMountedRef = useRef(true);
  const hasSkippedRef = useRef(false);
  const safetyTimeoutRef = useRef(null);

  const themeHex = PLAYER_HEX[winnerColor] || '#EF4444';

  // Responsive dimensions
  const cardWidth = Math.min(windowWidth * 0.88, 380);
  const avatarSize = Math.min(windowWidth * 0.22, 88);
  const isTabletOrTall = windowHeight > 800;

  // 1. Background fade animation (0 -> 0.85 in 250ms)
  const bgOpacity = useRef(new Animated.Value(0)).current;

  // 2. Rotating sunburst rays behind card (slow continuous loop)
  const raysRotate = useRef(new Animated.Value(0)).current;
  const raysLoopRef = useRef(null);

  // 3. Card spring & elements
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const crownDrop = useRef(new Animated.Value(-60)).current;
  const crownOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const trophyFloat = useRef(new Animated.Value(0)).current;
  const trophyLoopRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef(null);

  // 4. Confetti pieces (~32 items with fixed deterministic values)
  const confettiPieces = useRef(
    Array.from({ length: 32 }, (_, i) => {
      const palette = [
        themeHex,
        '#FFD700', // Gold
        '#F59E0B', // Amber
        '#FFFFFF', // White
        '#38BDF8', // Cyan
        '#EC4899', // Pink
      ];
      return {
        id: i,
        xPercent: (i / 32) * 94 + (Math.sin(i) * 3 + 3),
        delay: (i % 8) * 110 + Math.floor(Math.sin(i * 2) * 50),
        duration: 2100 + (i % 6) * 180,
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

  // 5. Star / sparkle burst behind avatar (8 stars)
  const starBurst = useRef(new Animated.Value(0)).current;
  const starBursts = useRef(
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 8;
      const dist = 76;
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
      };
    })
  ).current;

  // 6. Ranking list rows slide-up anims
  const rankRowsAnim = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current;

  // 7. Action buttons fade in anim
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(24)).current;

  // State to clean up confetti after falling
  const [showConfetti, setShowConfetti] = useState(true);

  // Skip all entrance animations immediately to end state
  const skipToEnd = useCallback(() => {
    if (hasSkippedRef.current) return;
    hasSkippedRef.current = true;

    // Fast-forward values
    bgOpacity.setValue(0.85);
    cardScale.setValue(1);
    cardOpacity.setValue(1);
    crownDrop.setValue(0);
    crownOpacity.setValue(1);
    titleScale.setValue(1);
    titleOpacity.setValue(1);
    starBurst.setValue(1);
    rankRowsAnim.forEach((anim) => anim.setValue(1));
    buttonsOpacity.setValue(1);
    buttonsTranslateY.setValue(0);
  }, [
    bgOpacity,
    cardScale,
    cardOpacity,
    crownDrop,
    crownOpacity,
    titleScale,
    titleOpacity,
    starBurst,
    rankRowsAnim,
    buttonsOpacity,
    buttonsTranslateY,
  ]);

  // Main animation timeline
  useEffect(() => {
    if (!visible) return;
    isMountedRef.current = true;
    hasSkippedRef.current = false;

    // Victory sound
    try {
      SoundFX.victory();
    } catch (soundErr) {
      console.warn('WinnerOverlay SoundFX.victory error:', soundErr);
    }
    // TODO hook: onWinnerSound for custom/external sound manager
    if (typeof onWinnerSound === 'function') {
      try {
        onWinnerSound();
      } catch (hookErr) {
        console.warn('onWinnerSound hook error:', hookErr);
      }
    }

    // 1. Dark background fade (250 ms)
    Animated.timing(bgOpacity, {
      toValue: 0.85,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    // 2. Rotating rays continuous loop
    raysLoopRef.current = Animated.loop(
      Animated.timing(raysRotate, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    raysLoopRef.current.start();

    // 3. Card spring in + Avatar crown bounce + Title pop
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 55,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();

    // Crown drops onto avatar with bounce
    Animated.sequence([
      Animated.delay(220),
      Animated.parallel([
        Animated.timing(crownOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(crownDrop, {
          toValue: 0,
          tension: 75,
          friction: 4.5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Text scale pop
    Animated.sequence([
      Animated.delay(360),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Star sparkle burst
    Animated.sequence([
      Animated.delay(280),
      Animated.timing(starBurst, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle Trophy float loop
    trophyLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(trophyFloat, {
          toValue: -8,
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

    // Pulse animation loop for avatar aura
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.14,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current.start();

    // 4. Confetti pieces fall
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

    // Remove confetti after 4 seconds
    const confettiTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setShowConfetti(false);
      }
    }, 4200);

    // 6. Ranking list slide up staggered (120ms each)
    if (rankings && rankings.length > 1) {
      const rankAnims = rankings.slice(0, 4).map((_, idx) =>
        Animated.timing(rankRowsAnim[idx], {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      );
      Animated.sequence([
        Animated.delay(650),
        Animated.stagger(120, rankAnims),
      ]).start();
    }

    // 7. Buttons fade in (quick entrance so user is never stuck)
    const buttonsDelay = rankings && rankings.length > 1 ? 500 : 320;
    Animated.sequence([
      Animated.delay(buttonsDelay),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Safety timeout: buttons must appear within 2.5 seconds even if an animation fails
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
      raysRotate.stopAnimation();
      if (raysLoopRef.current) raysLoopRef.current.stop();
      cardScale.stopAnimation();
      cardOpacity.stopAnimation();
      crownDrop.stopAnimation();
      crownOpacity.stopAnimation();
      titleScale.stopAnimation();
      titleOpacity.stopAnimation();
      trophyFloat.stopAnimation();
      if (trophyLoopRef.current) trophyLoopRef.current.stop();
      starBurst.stopAnimation();
      rankRowsAnim.forEach((a) => a.stopAnimation());
      buttonsOpacity.stopAnimation();
      buttonsTranslateY.stopAnimation();
      confettiPieces.forEach((p) => p.progress.stopAnimation());
    };
  }, [
    visible,
    bgOpacity,
    raysRotate,
    cardScale,
    cardOpacity,
    crownDrop,
    crownOpacity,
    titleScale,
    titleOpacity,
    trophyFloat,
    starBurst,
    rankRowsAnim,
    buttonsOpacity,
    buttonsTranslateY,
    confettiPieces,
    rankings,
    onWinnerSound,
    skipToEnd,
    pulseAnim,
  ]);

  // Handle Close (✕) or backdrop dismiss
  const handleClosePress = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    if (raysLoopRef.current) raysLoopRef.current.stop();
    if (trophyLoopRef.current) trophyLoopRef.current.stop();
    if (pulseLoopRef.current) pulseLoopRef.current.stop();
    try {
      SoundManager.play('buttonTap');
      SoundFX.button();
    } catch (_) { }
    if (typeof onClose === 'function') {
      onClose();
    } else {
      onHome?.();
    }
  }, [onClose, onHome]);

  // Handle Play Again button press with thorough cleanup
  const handlePlayAgainPress = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    if (raysLoopRef.current) raysLoopRef.current.stop();
    if (trophyLoopRef.current) trophyLoopRef.current.stop();
    if (pulseLoopRef.current) pulseLoopRef.current.stop();
    try {
      SoundManager.play('buttonTap');
      SoundFX.button();
    } catch (_) { }
    onPlayAgain?.();
  }, [onPlayAgain]);

  // Handle Home button press
  const handleHomePress = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    if (raysLoopRef.current) raysLoopRef.current.stop();
    if (trophyLoopRef.current) trophyLoopRef.current.stop();
    if (pulseLoopRef.current) pulseLoopRef.current.stop();
    try {
      SoundManager.play('buttonTap');
      SoundFX.button();
    } catch (_) { }
    onHome?.();
  }, [onHome]);

  const raysSpin = raysRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const winnerInitial = (winnerName || 'P').charAt(0).toUpperCase();

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* 1. Backdrop (blocks touches to the board behind it; tap skips anim or dismisses) */}
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

      {/* Decorative Container (Confetti & Rays - pointerEvents none) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* 2. Rotating Sunburst Light Rays behind card */}
        <View style={styles.raysCenterWrap}>
          <Animated.View
            style={[
              styles.raysContainer,
              {
                transform: [{ rotate: raysSpin }],
              },
            ]}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={`ray_${i}`}
                style={[
                  styles.rayBlade,
                  {
                    transform: [{ rotate: `${i * 30}deg` }],
                  },
                ]}
              />
            ))}
          </Animated.View>
        </View>

        {/* 4. Confetti Falling from top */}
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
                    transform: [
                      { translateY },
                      { translateX },
                      { rotate },
                    ],
                  },
                ]}
              />
            );
          })}
      </View>

      {/* 3. Center Content Card & Interactions */}
      <View style={styles.centerContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.cardBox,
            {
              width: cardWidth,
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
              paddingVertical: isTabletOrTall ? 28 : 22,
            },
          ]}
        >
          {/* Top-Right Close Button (✕) */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClosePress}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel="Close Winner Screen"
          >
            <CloseIcon size={18} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Avatar & Crown Section */}
          <View style={styles.avatarSection}>
            {/* Golden Crown with bounce drop */}
            <Animated.View
              style={[
                styles.crownWrapper,
                {
                  opacity: crownOpacity,
                  transform: [{ translateY: crownDrop }],
                },
              ]}
            >
              <CrownIcon size={44} color="#FDE047" />
            </Animated.View>

            {/* Avatar Circle in Winner Color */}
            <View
              style={[
                styles.avatarOuterCircle,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: themeHex,
                  borderColor: '#FFD700',
                  shadowColor: themeHex,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarInnerCircle,
                  {
                    width: avatarSize - 8,
                    height: avatarSize - 8,
                    borderRadius: (avatarSize - 8) / 2,
                  },
                ]}
              >
                <Text style={styles.avatarInitial}>{winnerInitial}</Text>
              </View>
            </View>
          </View>

          {/* Winner Text with Scale Pop */}
          <Animated.View
            style={[
              styles.titleWrapper,
              {
                opacity: titleOpacity,
                transform: [{ scale: titleScale }],
              },
            ]}
          >
            <Text style={styles.winnerText}>
              🏆 {winnerName.toUpperCase()} WINS!
            </Text>
            <Text style={styles.congratsSubtitle}>
              {isUserWinner
                ? '🎉 Outstanding Victory! You won the match!'
                : '🎮 Match Finished! Better luck next time!'}
            </Text>
          </Animated.View>

          {/* Rankings Standings Card */}
          {Array.isArray(rankings) && rankings.length > 0 && (
            <View style={styles.rankingContainer}>
              <View style={styles.rankingsHeaderRow}>
                <Text style={styles.rankingsHeaderTitle}>MATCH STANDINGS</Text>
              </View>
              {rankings.slice(0, 4).map((item, idx) => {
                const animVal = rankRowsAnim[idx] || new Animated.Value(1);
                const isWinnerRow = typeof item === 'object' ? (item.isWinner || idx === 0) : idx === 0;
                const itemColor = typeof item === 'object' ? (PLAYER_HEX[item.color] || item.color || '#3B82F6') : '#3B82F6';
                const itemName = typeof item === 'object' ? item.name : String(item);

                const rankBadges = ['WINNER', '2ND', '3RD', '4TH'];

                return (
                  <Animated.View
                    key={typeof item === 'object' ? (item.id || item.name || idx) : idx}
                    style={[
                      styles.rankRow,
                      {
                        borderColor: isWinnerRow ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                        backgroundColor: isWinnerRow ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        opacity: animVal,
                        transform: [
                          {
                            translateY: animVal.interpolate({
                              inputRange: [0, 1],
                              outputRange: [15, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.rankLeft}>
                      <View style={[styles.rankNumberBadge, isWinnerRow && styles.rankNumberBadgeWinner]}>
                        <Text style={[styles.rankNumberText, isWinnerRow && styles.rankNumberTextWinner]}>
                          #{idx + 1}
                        </Text>
                      </View>
                      <View style={[styles.rankColorDot, { backgroundColor: itemColor }]} />
                      <Text
                        style={[
                          styles.rankPlayerName,
                          isWinnerRow && styles.rankWinnerName,
                        ]}
                        numberOfLines={1}
                      >
                        {itemName || `Player ${idx + 1}`}
                      </Text>
                    </View>
                    <View style={styles.rankRight}>
                      <Text
                        style={[
                          styles.rankStatusBadge,
                          isWinnerRow ? styles.rankStatusWinner : styles.rankStatusFinished,
                        ]}
                      >
                        {rankBadges[idx] || `#${idx + 1}`}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {/* Action Buttons (Play Again & Home) */}
          <Animated.View
            style={[
              styles.buttonsRow,
              {
                opacity: buttonsOpacity,
                transform: [{ translateY: buttonsTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionBtn, styles.playAgainBtn]}
              onPress={handlePlayAgainPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Play Again"
            >
              <ReplayIcon size={18} color="#FFFFFF" />
              <Text style={styles.playAgainText}>PLAY AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.homeBtn]}
              onPress={handleHomePress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Home"
            >
              <BottomNavHomeIcon size={18} color="#FFFFFF" />
              <Text style={styles.homeText}>HOME</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

export default React.memo(WinnerOverlayComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030712',
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  raysCenterWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  raysContainer: {
    width: 520,
    height: 520,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rayBlade: {
    position: 'absolute',
    width: 28,
    height: 520,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 14,
  },
  confettiItem: {
    position: 'absolute',
    top: 0,
  },
  cardBox: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 20,

  },
  headerBadgeContainer: {
    marginTop: 2,
    marginBottom: 4,
    alignItems: 'center',
  },
  headerBadgePill: {
    backgroundColor: 'rgba(253, 224, 71, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  headerBadgeText: {
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  starBurstCenter: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    width: 1,
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sparkleStar: {
    position: 'absolute',
    fontSize: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
    justifyContent: 'center',

  },
  crownWrapper: {
    marginBottom: -10,
    zIndex: 30,
  },
  avatarOuterCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,

  },
  avatarInnerCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  winnerText: {
    color: '#FDE047',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(245, 158, 11, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  congratsSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  rewardCardWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  rewardPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 4,

  },
  rewardText: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  rankingContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rankingsHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 6,
    marginBottom: 6,
  },
  rankingsHeaderTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 5,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankNumberBadgeWinner: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  rankNumberText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  rankNumberTextWinner: {
    color: '#FDE047',
  },
  rankColorDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    marginRight: 8,

  },
  rankPlayerName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  rankWinnerName: {
    color: '#FDE047',
    fontWeight: '900',
  },
  rankRight: {
    marginLeft: 8,
  },
  rankStatusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.4,
  },
  rankStatusWinner: {
    backgroundColor: '#F59E0B',
    color: '#000000',
  },
  rankStatusFinished: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#94A3B8',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  playAgainBtn: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  homeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  homeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorFallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 7, 18, 0.92)',
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
