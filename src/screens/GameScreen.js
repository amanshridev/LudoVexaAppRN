import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  AppState,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createInitialState,
  rollDice,
  moveToken,
  passTurn,
  getTokenCoordinates,
  getTrackIndex,
} from '../ludo/LudoEngine.js';
import { GRID_SIZE, SAFE_INDICES, HOME_STEP } from '../ludo/LudoConstants.js';
import { chooseBestTokenToMove } from '../ludo/LudoAI.js';
import { SoundFX } from '../utils/soundFX.js';
import SoundManager from '../utils/SoundManager.js';
import { recordGameResult } from '../utils/storage.js';
import LudoBoardExact from '../components/board/LudoBoardExact.js';
import CornerPlayerDock from '../components/hud/CornerPlayerDock.js';
import PinToken3D from '../components/3d/PinToken3D.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  BackArrowIcon,
  FriendsIcon,
  RobotIcon,
  SettingsGearIcon,
} from '../components/ui/AppIcons.js';
import WinnerOverlay, { WinnerErrorBoundary } from '../components/WinnerOverlay.js';

const ENABLE_HOP_ANIMATION = true;
const BURST_ANGLES = [0, 0.785, 1.57, 2.356, 3.141, 3.927, 4.712, 5.497];
const BOARD_BORDER = 4;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_BOARD_SIZE = Math.max(0, Math.min(SCREEN_WIDTH - 32, SCREEN_HEIGHT * 0.52, 360));

const getCoordXY = (coords, currentCellSize) => {
  if (!coords) return { x: 0, y: 0 };
  const currentTokenSize = currentCellSize * 0.72;
  const currentTokenHeight = currentTokenSize * 1.3;
  return {
    x: BOARD_BORDER + (coords.c || 0) * currentCellSize + 0.5 * (currentCellSize - currentTokenSize),
    y: BOARD_BORDER + (coords.r || 0) * currentCellSize + 0.52 * currentCellSize - 0.8308 * currentTokenHeight,
  };
};

export default function GameScreen({
  gameOptions = {},
  onExitHome,
  onOpenSettings,
  onGameOver,
  settings = {},
  isDarkMode = false,
}) {
  const { appTheme } = useTheme();
  const [gameState, setGameState] = useState(() => createInitialState(gameOptions));
  const [isRolling, setIsRolling] = useState(false);
  const [rollingDiceValue, setRollingDiceValue] = useState(null);
  const [rollNotice, setRollNotice] = useState(null);
  // Pre-initialize board dimensions from screen width/height so frame 0 renders immediately without blank delay
  const [boardArea, setBoardArea] = useState(() => ({
    width: SCREEN_WIDTH,
    height: Math.max(INITIAL_BOARD_SIZE + 20, SCREEN_HEIGHT * 0.52),
  }));

  const bgColor = appTheme?.colors?.background || (isDarkMode ? '#050B14' : '#0B1A30');

  const boardSize = Math.max(
    0,
    Math.min(boardArea.width - 32, boardArea.height - 20, 360)
  );
  const cellSize = boardSize > 0 ? (boardSize - BOARD_BORDER * 2) / 15 : 0;

  // Ghost moving token state and refs
  const [movingToken, setMovingToken] = useState(null);
  const ghostPos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ghostLift = React.useRef(new Animated.Value(0)).current;
  const ghostScale = React.useRef(new Animated.Value(1)).current;
  const isAnimatingRef = React.useRef(false);
  const isMountedRef = React.useRef(true);

  // Winner Celebration Overlay State & Ref
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const hasShownWinnerRef = React.useRef(false);

  // Stage 3: Effect state and animated refs
  // 1. Capture effect refs & state
  const [capturedAnimToken, setCapturedAnimToken] = useState(null);
  const capturedGhostPos = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const capturedGhostLift = React.useRef(new Animated.Value(0)).current;
  const capturedGhostScale = React.useRef(new Animated.Value(1)).current;
  const capturedShake = React.useRef(new Animated.Value(0)).current;
  const [captureRing, setCaptureRing] = useState(null);
  const ringScale = React.useRef(new Animated.Value(0)).current;
  const ringOpacity = React.useRef(new Animated.Value(0.8)).current;

  // 2. Safe cell effect refs & state
  const [safeGlow, setSafeGlow] = useState(null);
  const safeGlowOpacity = React.useRef(new Animated.Value(0)).current;

  // 3. Extra turn badge refs & state
  const [showExtraTurn, setShowExtraTurn] = useState(false);
  const extraTurnAnim = React.useRef(new Animated.Value(0)).current;
  const extraTurnScale = React.useRef(new Animated.Value(0.5)).current;

  // 5. Token finished particle burst refs & state
  const [finishedBurst, setFinishedBurst] = useState(null);
  const burstProgress = React.useRef(new Animated.Value(0)).current;

  // Sound state and SoundManager lifecycle
  const [isMuted, setIsMuted] = useState(settings.sound === false);

  useEffect(() => {
    // Slight deferral allows initial layout and component render to complete smoothly
    const soundInitTimer = setTimeout(() => {
      try {
        SoundManager.init();
        SoundManager.setMuted(settings.sound === false);
      } catch (_) { }
    }, 20);

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState.match(/inactive|background/)) {
        try {
          SoundManager.stopAll();
        } catch (_) { }
      }
    });

    return () => {
      clearTimeout(soundInitTimer);
      try {
        appStateSub?.remove?.();
        // Stop any active sounds on unmount without releasing cached instances
        SoundManager.stopAll();
      } catch (_) { }
    };
  }, [settings.sound]);

  // Sync sound setting
  useEffect(() => {
    try {
      const muted = settings.sound === false;
      setIsMuted(muted);
      SoundManager.setMuted(muted);
      SoundFX.setSoundEnabled(!muted);
    } catch (_) { }
  }, [settings.sound]);

  const toggleSoundMute = React.useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        SoundManager.setMuted(next);
        SoundFX.setSoundEnabled(!next);
        if (!next) {
          SoundManager.play('buttonTap');
        }
      } catch (_) { }
      return next;
    });
  }, []);

  // Handle unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      hasShownWinnerRef.current = false;
      ghostPos.stopAnimation();
      ghostLift.stopAnimation();
      ghostScale.stopAnimation();
      capturedGhostPos.stopAnimation();
      capturedGhostLift.stopAnimation();
      capturedGhostScale.stopAnimation();
      capturedShake.stopAnimation();
      ringScale.stopAnimation();
      ringOpacity.stopAnimation();
      safeGlowOpacity.stopAnimation();
      extraTurnAnim.stopAnimation();
      extraTurnScale.stopAnimation();
      burstProgress.stopAnimation();
    };
  }, [
    ghostPos,
    ghostLift,
    ghostScale,
    capturedGhostPos,
    capturedGhostLift,
    capturedGhostScale,
    capturedShake,
    ringScale,
    ringOpacity,
    safeGlowOpacity,
    extraTurnAnim,
    extraTurnScale,
    burstProgress,
  ]);

  // Check if current turn belongs to a bot
  const isAiTurn =
    (gameState.playerTypes
      ? gameState.playerTypes[gameState.currentTurn] === 'bot'
      : gameState.isVsAi && gameState.currentTurn !== 'red') &&
    gameState.status !== 'GAME_OVER' &&
    !isAnimatingRef.current;

  const canRoll = !isRolling && !isAnimatingRef.current && gameState.status === 'ROLLING' && !isAiTurn;

  // Board state hiding both moving token and captured token during animations
  const displayedState = React.useMemo(() => {
    if (!movingToken && !capturedAnimToken) return gameState;
    const hideTokens = (player) => {
      let list = gameState.tokens[player] || [];
      if (movingToken && movingToken.color === player) {
        list = list.filter((t) => t.id !== movingToken.tokenId);
      }
      if (capturedAnimToken && capturedAnimToken.color === player) {
        list = list.filter((t) => t.id !== capturedAnimToken.tokenId);
      }
      return list;
    };

    const newTokens = {};
    gameState.activePlayers.forEach((p) => {
      newTokens[p] = hideTokens(p);
    });

    return {
      ...gameState,
      movableTokenIds: [],
      tokens: newTokens,
    };
  }, [gameState, movingToken, capturedAnimToken]);

  // Animate ghost token hopping cell-by-cell along path
  const animateMove = React.useCallback(async (tokenId, color, cells, oldCoord) => {
    if (!isMountedRef.current || cells.length === 0) return;

    const startXY = getCoordXY(oldCoord, cellSize);
    ghostPos.setValue(startXY);
    ghostLift.setValue(0);
    ghostScale.setValue(1);

    setMovingToken({ tokenId, color });

    // Brief yield for component to mount ghost and hide real token
    await new Promise((resolve) => setTimeout(resolve, 20));

    for (let i = 0; i < cells.length; i++) {
      if (!isMountedRef.current) break;

      const cell = cells[i];
      console.log('HOP', tokenId, cell);
      try {
        const stepRate = Math.min(1.5, 1.0 + (i * 0.05));
        SoundManager.play('step', { volume: 0.35, rate: stepRate });
        SoundFX.hop();
      } catch (_) { }

      const isLast = i === cells.length - 1;
      const targetXY = getCoordXY(cell, cellSize);

      await new Promise((resolve) => {
        if (!isMountedRef.current) {
          resolve();
          return;
        }

        Animated.parallel([
          Animated.timing(ghostPos, {
            toValue: targetXY,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ghostLift, {
              toValue: -cellSize * 0.35,
              duration: 60,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(ghostLift, {
              toValue: 0,
              duration: 60,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ghostScale, {
              toValue: isLast ? 1.25 : 1.12,
              duration: 60,
              useNativeDriver: true,
            }),
            Animated.timing(ghostScale, {
              toValue: 1.0,
              duration: 60,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => resolve());
      });
    }
  }, [cellSize, ghostPos, ghostLift, ghostScale]);

  // 1. Capture Effect: attacker squash bounce + ring + captured shake + fly back to home + settle spring
  const runCaptureEffect = React.useCallback(async (capturedToken, finalCoord) => {
    if (!isMountedRef.current || cellSize <= 0) return;
    const capCoord = getTokenCoordinates(capturedToken);
    const capStartXY = getCoordXY(capCoord, cellSize);
    const homeCoord = getTokenCoordinates({
      player: capturedToken.player,
      step: -1,
      index: capturedToken.index,
    });
    const capTargetXY = getCoordXY(homeCoord, cellSize);

    const centerRing = {
      x: BOARD_BORDER + (finalCoord.c + 0.5) * cellSize,
      y: BOARD_BORDER + (finalCoord.r + 0.5) * cellSize,
    };

    capturedGhostPos.setValue(capStartXY);
    capturedGhostLift.setValue(0);
    capturedGhostScale.setValue(1);
    capturedShake.setValue(0);

    ringScale.setValue(0);
    ringOpacity.setValue(0.8);
    setCaptureRing(centerRing);
    setCapturedAnimToken({ tokenId: capturedToken.id, color: capturedToken.player });

    try {
      SoundManager.play('kill', { volume: 0.95 });
      SoundFX.capture();
    } catch (_) { }

    // 100ms after kill impact: play victim down-tone (killed / killedMine)
    setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        const isVictimMine = capturedToken.player === userColor;
        SoundManager.play(isVictimMine ? 'killedMine' : 'killed', { volume: 0.85 });
      } catch (_) { }
    }, 100);

    // Attacker squash bounce (1 -> 1.3 -> 0.9 -> 1) + expanding ring (scale 0 -> 2, opacity 0.8 -> 0, 300 ms)
    // Simultaneously: Captured token shakes (200 ms)
    await Promise.all([
      new Promise((res) => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ghostScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
            Animated.timing(ghostScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(ghostScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ringScale, { toValue: 2.0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]).start(() => {
          setCaptureRing(null);
          res();
        });
      }),
      new Promise((res) => {
        Animated.sequence([
          Animated.timing(capturedShake, { toValue: -4, duration: 40, useNativeDriver: true }),
          Animated.timing(capturedShake, { toValue: 4, duration: 40, useNativeDriver: true }),
          Animated.timing(capturedShake, { toValue: -3, duration: 40, useNativeDriver: true }),
          Animated.timing(capturedShake, { toValue: 3, duration: 40, useNativeDriver: true }),
          Animated.timing(capturedShake, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start(() => res());
      }),
    ]);

    // Captured token flies back to its home slot using the same ghost method (400 ms)
    try {
      SoundManager.play('captureReturn', { volume: 0.7 });
    } catch (_) { }
    await new Promise((res) => {
      Animated.parallel([
        Animated.timing(capturedGhostPos, {
          toValue: capTargetXY,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(capturedGhostLift, {
            toValue: -cellSize * 0.45,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(capturedGhostLift, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => res());
    });

    // Settles with a spring
    await new Promise((res) => {
      capturedGhostScale.setValue(1.25);
      Animated.spring(capturedGhostScale, {
        toValue: 1.0,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }).start(() => res());
    });

    setCapturedAnimToken(null);
  }, [cellSize, ghostScale, ringScale, ringOpacity, capturedGhostPos, capturedGhostLift, capturedGhostScale, capturedShake, userColor]);

  // 2. Safe Cell: short glow (opacity 0 -> 0.6 -> 0, 400 ms) + tiny bounce
  const runSafeCellEffect = React.useCallback(async (finalCoord) => {
    if (!isMountedRef.current || cellSize <= 0) return;
    const cellXY = {
      x: BOARD_BORDER + (finalCoord.c || 0) * cellSize,
      y: BOARD_BORDER + (finalCoord.r || 0) * cellSize,
    };
    safeGlowOpacity.setValue(0);
    setSafeGlow(cellXY);
    try {
      SoundManager.play('safe', { volume: 0.7 });
    } catch (_) { }

    await new Promise((res) => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(safeGlowOpacity, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(safeGlowOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ghostLift, {
            toValue: -cellSize * 0.18,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ghostLift, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setSafeGlow(null);
        res();
      });
    });
  }, [cellSize, ghostLift, safeGlowOpacity]);

  // 3. Extra Turn on 6: floating badge "🎲 EXTRA TURN" at board center
  // fade+scale in 200 ms, hold 700 ms, fade out 200 ms, pointerEvents="none"
  const runExtraTurnBadge = React.useCallback(async () => {
    if (!isMountedRef.current) return;
    extraTurnAnim.setValue(0);
    extraTurnScale.setValue(0.5);
    setShowExtraTurn(true);
    try {
      SoundManager.play('extraTurn', { volume: 0.85 });
    } catch (_) { }

    await new Promise((res) => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(extraTurnAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(extraTurnScale, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(700),
        Animated.parallel([
          Animated.timing(extraTurnAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(extraTurnScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowExtraTurn(false);
        res();
      });
    });
  }, [extraTurnAnim, extraTurnScale]);

  // 5. Token Finished: bounce + 6-8 small circles flying outward and fading (fixed count: 8, 400 ms)
  const runTokenFinishedEffect = React.useCallback(async (centerCoord, playerColor) => {
    if (!isMountedRef.current || cellSize <= 0) return;
    const landingXY = getCoordXY(centerCoord, cellSize);
    const tokenCenter = {
      x: landingXY.x + (cellSize * 0.65) / 2,
      y: landingXY.y + (cellSize * 0.65) / 2,
    };
    burstProgress.setValue(0);
    setFinishedBurst({ ...tokenCenter, color: playerColor });
    try {
      SoundManager.play('tokenFinish', { volume: 0.9 });
      SoundFX.victory();
    } catch (_) { }

    await new Promise((res) => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ghostLift, {
            toValue: -cellSize * 0.38,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ghostLift, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(burstProgress, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFinishedBurst(null);
        res();
      });
    });
  }, [cellSize, ghostLift, burstProgress]);

  const userColor = gameState.userColor || gameOptions.userColor || 'red';

  const PLAYER_HEX = {
    red: '#EF4444',
    green: '#10B981',
    yellow: '#F59E0B',
    blue: '#3B82F6',
  };

  const getPlayerLabel = React.useCallback((color) => {
    const isHuman = gameState.playerTypes?.[color] === 'human';
    if (gameState.isVsAi) {
      if (color === userColor) return 'You';
      if (color === 'green') return isHuman ? 'Green' : 'Computer 2';
      if (color === 'yellow') return isHuman ? 'Yellow' : 'Computer 3';
      if (color === 'blue') return isHuman ? 'Blue' : 'Computer 4';
      if (color === 'red') return isHuman ? 'Red' : 'Computer 1';
    }
    if (color === 'red') return 'Player 1';
    if (color === 'green') return 'Player 2';
    if (color === 'yellow') return 'Player 3';
    if (color === 'blue') return 'Player 4';
    return color.charAt(0).toUpperCase() + color.slice(1);
  }, [gameState.playerTypes, gameState.isVsAi, userColor]);

  // Restart match fresh with thorough reset of all state & animations
  const handleRestartGame = React.useCallback(() => {
    hasShownWinnerRef.current = false;
    setShowWinnerOverlay(false);
    setWinnerData(null);

    setGameState(createInitialState(gameOptions));
    setIsRolling(false);
    setRollingDiceValue(null);
    setRollNotice(null);
    setLastDiceValues({});
    setMovingToken(null);
    setCapturedAnimToken(null);
    setCaptureRing(null);
    setSafeGlow(null);
    setFinishedBurst(null);
    setShowExtraTurn(false);
    isAnimatingRef.current = false;
  }, [gameOptions]);

  // Exit back to home
  const handleWinnerHome = React.useCallback(() => {
    hasShownWinnerRef.current = false;
    setShowWinnerOverlay(false);
    setWinnerData(null);
    if (onExitHome) {
      onExitHome();
    }
  }, [onExitHome]);

  // Handle token selection with ghost hopping animation and Stage 3 effects
  const handleSelectToken = React.useCallback(async (tokenId) => {
    if (isAnimatingRef.current) return;
    if (gameState.status !== 'WAITING_SELECT') return;
    if (!gameState.movableTokenIds.includes(tokenId)) {
      try {
        SoundManager.play('invalid');
      } catch (_) { }
      return;
    }

    const player = gameState.currentTurn;
    const playerTokens = gameState.tokens[player] || [];
    const token = playerTokens.find((t) => t.id === tokenId);
    if (!token) return;

    isAnimatingRef.current = true;
    setRollNotice(null);
    try {
      SoundManager.play('tokenSelect');
    } catch (_) { }

    // 7-second safety timeout that force-releases lock if anything hangs
    const safetyTimeout = setTimeout(() => {
      console.warn('Animation safety timeout triggered (7s)');
      if (isMountedRef.current) {
        setMovingToken(null);
        setCapturedAnimToken(null);
        setCaptureRing(null);
        setSafeGlow(null);
        setFinishedBurst(null);
        setShowExtraTurn(false);
      }
      isAnimatingRef.current = false;
    }, 7000);

    try {
      const startStep = token.step;
      const diceVal = gameState.diceValue || 0;

      // Calculate final state from engine (exact rules logic untouched)
      const finalState = moveToken(gameState, tokenId);
      const updatedToken = (finalState.tokens[player] || []).find((t) => t.id === tokenId);
      const finalStep = updatedToken ? updatedToken.step : (startStep === -1 ? 0 : startStep + diceVal);

      // Build step-by-step sequence of cells
      const stepsPath = [];
      if (startStep === -1) {
        try {
          SoundManager.play('tokenEnter', { volume: 0.85 });
        } catch (_) { }
        stepsPath.push(0);
      } else {
        for (let s = startStep + 1; s <= finalStep; s++) {
          stepsPath.push(s);
        }
      }

      if (ENABLE_HOP_ANIMATION && stepsPath.length > 0 && cellSize > 0) {
        try {
          const cells = stepsPath.map((s) => ({
            step: s,
            ...getTokenCoordinates({ player, step: s, index: token.index }),
          }));
          const oldCoord = getTokenCoordinates({ player, step: startStep, index: token.index });

          await animateMove(tokenId, player, cells, oldCoord);
        } catch (animErr) {
          console.error('Hop animation error, falling back to instant move:', animErr);
        }
      }

      // STAGE 3: EFFECTS (All run AFTER the hop finishes and BEFORE existing turn change code)
      const finalCoord = getTokenCoordinates({ player, step: finalStep, index: token.index });

      // 1. Capture check
      let capturedToken = null;
      gameState.activePlayers.forEach((opp) => {
        if (opp !== player) {
          (gameState.tokens[opp] || []).forEach((tOld) => {
            const tNew = (finalState.tokens[opp] || []).find((t) => t.id === tOld.id);
            if (tOld.step >= 0 && tNew && tNew.step === -1) {
              capturedToken = tOld;
            }
          });
        }
      });

      // 2. Safe cell check
      const finalTrackIdx = (finalStep >= 0 && finalStep <= 50) ? getTrackIndex(player, finalStep) : -1;
      const isSafeCell = SAFE_INDICES.includes(finalTrackIdx) && !capturedToken;

      // 3. Finished check
      const isFinished = updatedToken?.isHome || finalStep === HOME_STEP;

      // 4. Extra turn on 6 check
      const isSix = diceVal === 6;

      try {
        if (capturedToken) {
          await runCaptureEffect(capturedToken, finalCoord);
        } else if (isSafeCell) {
          await runSafeCellEffect(finalCoord);
        } else if (isFinished) {
          await runTokenFinishedEffect(finalCoord, player);
        }

        if (isSix) {
          await runExtraTurnBadge();
        }
      } catch (effectErr) {
        console.error('Stage 3 effect error:', effectErr);
      }

      // Apply the final calculated state (move, capture, extra turn, turn switch)
      if (isMountedRef.current) {
        setGameState(finalState);

        if (finalState.status === 'GAME_OVER') {
          try {
            SoundManager.play('winner', { volume: 1.0 });
            SoundFX.victory();
          } catch (soundErr) {
            console.warn('Sound error:', soundErr);
          }

          recordGameResult({
            won: finalState.winners[0] === 'red',
            captures: finalState.stats.red?.captures || 0,
            homeRuns: finalState.stats.red?.homeCount || 0,
          });

          // Open premium celebration overlay exactly once per game
          if (!hasShownWinnerRef.current) {
            hasShownWinnerRef.current = true;
            const winnerColor = finalState.winners[0] || 'red';
            const winnerName = getPlayerLabel(winnerColor);
            const isUserWinner = winnerColor === userColor;

            // Rankings list: only if game has 2nd/3rd/4th places in existing logic (more than 2 players)
            // If the game ends at the first winner (2-player game), skip the list
            let rankings = [];
            if (finalState.activePlayers.length > 2) {
              const allRankedColors = [
                ...finalState.winners,
                ...finalState.activePlayers.filter((p) => !finalState.winners.includes(p)),
              ];
              rankings = allRankedColors.map((color, index) => ({
                rank: index + 1,
                color,
                name: getPlayerLabel(color),
                isWinner: index === 0,
                isUser: color === userColor,
              }));
            }

            setWinnerData({
              winnerColor,
              winnerName,
              isUserWinner,
              rankings,
              coinsWon: 200,
            });
            setShowWinnerOverlay(true);
          }
        } else if (finalState.lastEvent && finalState.lastEvent.includes('Captured')) {
          // Capture sound already played on impact
        } else {
          try {
            SoundManager.play('turnChange', { volume: 0.25 });
            SoundFX.turnSwitch();
          } catch (_) { }
        }
      }
    } catch (err) {
      console.error('Error in handleSelectToken:', err);
    } finally {
      clearTimeout(safetyTimeout);
      if (isMountedRef.current) {
        setMovingToken(null);
        setCapturedAnimToken(null);
        setCaptureRing(null);
        setSafeGlow(null);
        setFinishedBurst(null);
        setShowExtraTurn(false);
      }
      isAnimatingRef.current = false;
    }
  }, [
    gameState,
    cellSize,
    animateMove,
    runCaptureEffect,
    runSafeCellEffect,
    runTokenFinishedEffect,
    runExtraTurnBadge,
    userColor,
    getPlayerLabel,
  ]);

  // Handle dice roll
  const triggerRoll = React.useCallback(() => {
    if (isRolling || isAnimatingRef.current || gameState.status !== 'ROLLING') {
      return;
    }

    isAnimatingRef.current = true;
    setIsRolling(true);
    setRollNotice(null);
    try {
      SoundManager.play('diceRoll');
      SoundFX.dice();
    } catch (_) { }

    const nextState = rollDice(gameState);
    const rolledVal = nextState.diceValue;
    setRollingDiceValue(rolledVal);

    // Roll animation delay (560ms rotate+shake, real value shown + pop spring)
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setGameState(nextState);
      setRollingDiceValue(null);
      setIsRolling(false);
      isAnimatingRef.current = false;
      try {
        SoundManager.play('diceLand');
      } catch (_) { }

      const isSix = rolledVal === 6;
      const isBotTurn = nextState.playerTypes?.[nextState.currentTurn] === 'bot';

      if (nextState.status === 'NO_MOVES') {
        setRollNotice(`❌ Rolled ${rolledVal} — No moves! Passing turn...`);
        setTimeout(() => {
          if (!isMountedRef.current) return;
          setRollNotice(null);
          setGameState((prev) => passTurn(prev));
          try {
            SoundManager.play('turnChange');
            SoundFX.turnSwitch();
          } catch (_) { }
        }, 1000);
      } else if (nextState.movableTokenIds.length === 1 && isBotTurn) {
        // Auto-move single valid token only for BOT turns
        const singleTokenId = nextState.movableTokenIds[0];
        setRollNotice(`🎲 Rolled ${rolledVal}! Moving token...`);
        setTimeout(() => {
          if (!isMountedRef.current) return;
          handleSelectToken(singleTokenId);
        }, 220);
      } else {
        if (isSix) {
          setRollNotice('🎉 Rolled a 6! Tap a token to move!');
        } else {
          setRollNotice(`🎲 Rolled ${rolledVal}! Tap a token to move`);
        }
      }
    }, 600);
  }, [isRolling, gameState, handleSelectToken]);

  // AI automation loop
  useEffect(() => {
    let timer = null;

    if (isAiTurn && !isAnimatingRef.current) {
      if (gameState.status === 'ROLLING' && !isRolling && !rollNotice) {
        timer = setTimeout(() => {
          triggerRoll();
        }, 450);
      } else if (gameState.status === 'WAITING_SELECT' && !isRolling) {
        timer = setTimeout(() => {
          const bestTokenId = chooseBestTokenToMove(
            gameState,
            settings.aiDifficulty || 'medium'
          );
          if (bestTokenId) {
            handleSelectToken(bestTokenId);
          }
        }, 450);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [gameState, isAiTurn, isRolling, rollNotice, triggerRoll, handleSelectToken, settings.aiDifficulty]);

  // Persistent last rolled dice values per player (stops reverting to 6 after flip/move)
  const [lastDiceValues, setLastDiceValues] = useState({});

  useEffect(() => {
    if (gameState.diceValue != null && gameState.diceValue >= 1 && gameState.diceValue <= 6) {
      setLastDiceValues((prev) => ({
        ...prev,
        [gameState.currentTurn]: gameState.diceValue,
      }));
    }
  }, [gameState.diceValue, gameState.currentTurn]);

  const getPlayerDiceValue = (player) => {
    if (gameState.currentTurn === player) {
      if (rollingDiceValue != null) return rollingDiceValue;
      if (gameState.diceValue) return gameState.diceValue;
    }
    return lastDiceValues[player] || 6;
  };

  const activeTurnColor = PLAYER_HEX[gameState.currentTurn] || '#EF4444';
  const playerTurnName = getPlayerLabel(gameState.currentTurn || 'red').toUpperCase();

  // Dock positioning: User at bottom, AI at top
  const is2Player = gameState.activePlayers.length === 2;
  const topPlayers = gameState.activePlayers.filter((p) => p !== userColor);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      {/* Top Header Row with Back Button, Room Mode Badge, Speaker & Settings */}
      <View style={[styles.topHeader, { marginBottom: 15 }]}>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            try {
              SoundManager.play('buttonTap');
            } catch (_) { }
            onExitHome?.();
          }}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <BackArrowIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          {gameOptions.isVsAi ? (
            <RobotIcon size={15} color="#38BDF8" />
          ) : (
            <FriendsIcon size={15} color="#38BDF8" />
          )}
          <Text style={styles.matchModeText}>
            {gameOptions.isVsAi ? 'VS AI' : 'PASS & PLAY'} • {gameState.activePlayers?.length || gameOptions.playerCount || 4} PLAYERS
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>


          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              try {
                SoundManager.play('buttonTap');
              } catch (_) { }
              onOpenSettings?.();
            }}
            style={styles.circleIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <SettingsGearIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Docks Row (AI / Opponents) */}
      <View style={styles.topDocksRow}>
        {is2Player ? (
          <CornerPlayerDock
            player={topPlayers[0] || 'yellow'}
            playerName={getPlayerLabel(topPlayers[0] || 'yellow')}
            diceValue={getPlayerDiceValue(topPlayers[0] || 'yellow')}
            isTurn={gameState.currentTurn === (topPlayers[0] || 'yellow')}
            isRolling={isRolling && gameState.currentTurn === (topPlayers[0] || 'yellow')}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === (topPlayers[0] || 'yellow')}
            isBot={gameState.playerTypes?.[topPlayers[0] || 'yellow'] === 'bot'}
            layout="left-badge"
          />
        ) : (
          <>
            {gameState.activePlayers.includes('green') ? (
              <CornerPlayerDock
                player="green"
                playerName={getPlayerLabel('green')}
                diceValue={getPlayerDiceValue('green')}
                isTurn={gameState.currentTurn === 'green'}
                isRolling={isRolling && gameState.currentTurn === 'green'}
                onRoll={triggerRoll}
                canRoll={canRoll && gameState.currentTurn === 'green'}
                isBot={gameState.playerTypes?.green === 'bot'}
                layout="left-badge"
              />
            ) : <View />}

            {gameState.activePlayers.includes('yellow') ? (
              <CornerPlayerDock
                player="yellow"
                playerName={getPlayerLabel('yellow')}
                diceValue={getPlayerDiceValue('yellow')}
                isTurn={gameState.currentTurn === 'yellow'}
                isRolling={isRolling && gameState.currentTurn === 'yellow'}
                onRoll={triggerRoll}
                canRoll={canRoll && gameState.currentTurn === 'yellow'}
                isBot={gameState.playerTypes?.yellow === 'bot'}
                layout="right-badge"
              />
            ) : <View />}
          </>
        )}
      </View>

      {/* Floating Status & Event Notice Banner */}


      {/* Center Ludo Board */}
      <View
        style={styles.boardContainer}
        onLayout={({ nativeEvent }) => {
          const { width, height } = nativeEvent.layout;
          if (width > 0 && height > 0) {
            setBoardArea((current) => {
              if (Math.abs(current.width - width) < 3 && Math.abs(current.height - height) < 3) {
                return current;
              }
              return { width, height };
            });
          }
        }}
      >
        <View style={[styles.boardWrapperRelative, { width: boardSize, height: boardSize }]}>
          <LudoBoardExact
            state={displayedState}
            onSelectToken={handleSelectToken}
            boardSize={boardSize}
            theme={settings?.ludoTheme || settings?.theme || 'classic'}
            isAnimating={isAnimatingRef.current || isRolling}
          />

          {/* Safe Cell Glow */}
          {safeGlow && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.safeCellGlow,
                {
                  left: safeGlow.x,
                  top: safeGlow.y,
                  width: cellSize,
                  height: cellSize,
                  opacity: safeGlowOpacity,
                },
              ]}
            />
          )}

          {/* Capture Expanding Ring */}
          {captureRing && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.captureRing,
                {
                  left: captureRing.x - cellSize * 0.75,
                  top: captureRing.y - cellSize * 0.75,
                  width: cellSize * 1.5,
                  height: cellSize * 1.5,
                  borderRadius: (cellSize * 1.5) / 2,
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                },
              ]}
            />
          )}

          {/* Ghost Moving Token Overlay */}
          {movingToken && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ghostToken,
                {
                  width: cellSize * 0.72,
                  height: cellSize * 0.72 * 1.3,
                  transform: [
                    { translateX: ghostPos.x },
                    { translateY: ghostPos.y },
                    { translateY: ghostLift },
                    { scale: ghostScale },
                  ],
                },
              ]}
            >
              <PinToken3D
                token={{ id: movingToken.tokenId, player: movingToken.color }}
                size={cellSize * 0.72}
                isMovable={false}
              />
            </Animated.View>
          )}

          {/* Captured Ghost Token Overlay */}
          {capturedAnimToken && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ghostToken,
                {
                  width: cellSize * 0.72,
                  height: cellSize * 0.72 * 1.3,
                  zIndex: 80,
                  transform: [
                    { translateX: capturedGhostPos.x },
                    { translateY: capturedGhostPos.y },
                    { translateX: capturedShake },
                    { translateY: capturedGhostLift },
                    { scale: capturedGhostScale },
                  ],
                },
              ]}
            >
              <PinToken3D
                token={{ id: capturedAnimToken.tokenId, player: capturedAnimToken.color }}
                size={cellSize * 0.72}
                isMovable={false}
              />
            </Animated.View>
          )}

          {/* Token Finished Particle Burst (8 small circles) */}
          {finishedBurst && (
            <View
              pointerEvents="none"
              style={[
                styles.burstContainer,
                {
                  left: finishedBurst.x,
                  top: finishedBurst.y,
                },
              ]}
            >
              {BURST_ANGLES.map((angle, idx) => {
                const dist = cellSize * 1.25;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                return (
                  <Animated.View
                    key={`burst_${idx}`}
                    style={[
                      styles.burstCircle,
                      {
                        backgroundColor: idx % 2 === 0 ? '#FACC15' : '#38BDF8',
                        opacity: burstProgress.interpolate({
                          inputRange: [0, 0.7, 1],
                          outputRange: [1, 0.8, 0],
                        }),
                        transform: [
                          {
                            translateX: burstProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, dx],
                            }),
                          },
                          {
                            translateY: burstProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, dy],
                            }),
                          },
                          {
                            scale: burstProgress.interpolate({
                              inputRange: [0, 0.4, 1],
                              outputRange: [0.6, 1.3, 0.2],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}

          {/* Extra Turn on 6 Floating Badge at Board Center */}
          {showExtraTurn && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.extraTurnFloatingBadge,
                {
                  left: (boardSize - 170) / 2,
                  top: (boardSize - 44) / 2,
                  opacity: extraTurnAnim,
                  transform: [{ scale: extraTurnScale }],
                },
              ]}
            >
              <Text style={styles.extraTurnBadgeText}>🎲 EXTRA TURN</Text>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Bottom Docks Row (User at bottom left, opponent at bottom right if 4P) */}
      <View style={styles.bottomDocksRow}>
        {gameState.activePlayers.includes(userColor) ? (
          <CornerPlayerDock
            player={userColor}
            playerName={getPlayerLabel(userColor)}
            diceValue={getPlayerDiceValue(userColor)}
            isTurn={gameState.currentTurn === userColor}
            isRolling={isRolling && gameState.currentTurn === userColor}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === userColor}
            isBot={gameState.playerTypes?.[userColor] === 'bot'}
            layout="left-badge"
          />
        ) : (
          <CornerPlayerDock
            player="red"
            playerName={getPlayerLabel('red')}
            diceValue={getPlayerDiceValue('red')}
            isTurn={gameState.currentTurn === 'red'}
            isRolling={isRolling && gameState.currentTurn === 'red'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'red'}
            isBot={gameState.playerTypes?.red === 'bot'}
            layout="left-badge"
          />
        )}

        {!is2Player && gameState.activePlayers.includes('blue') && userColor !== 'blue' ? (
          <CornerPlayerDock
            player="blue"
            playerName={getPlayerLabel('blue')}
            diceValue={getPlayerDiceValue('blue')}
            isTurn={gameState.currentTurn === 'blue'}
            isRolling={isRolling && gameState.currentTurn === 'blue'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'blue'}
            isBot={gameState.playerTypes?.blue === 'bot'}
            layout="right-badge"
          />
        ) : <View />}
      </View>

      {/* Premium Winner Celebration Overlay */}
      {showWinnerOverlay && winnerData && (
        <WinnerErrorBoundary
          fallbackOnGameOver={() => {
            onGameOver?.({
              winner: winnerData.winnerColor,
              coinsWon: winnerData.coinsWon,
              opponent: 'Player 3',
            });
          }}
          onPlayAgain={handleRestartGame}
        >
          <WinnerOverlay
            visible={showWinnerOverlay}
            winnerColor={winnerData.winnerColor}
            winnerName={winnerData.winnerName}
            isUserWinner={winnerData.isUserWinner}
            rankings={winnerData.rankings}
            coinsWon={winnerData.coinsWon}
            onPlayAgain={handleRestartGame}
            onHome={handleWinnerHome}
          />
        </WinnerErrorBoundary>
      )}

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1A30',
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerSideSpacer: {
    width: 38,
    height: 38,
  },
  circleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  matchModeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  topDocksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 62,
    marginVertical: 4,
    zIndex: 20,
  },
  boardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  boardWrapperRelative: {
    position: 'relative',
  },
  ghostToken: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 999,
    elevation: 10,
  },
  captureRing: {
    position: 'absolute',
    borderWidth: 3.5,
    borderColor: '#EF4444',
    zIndex: 85,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  safeCellGlow: {
    position: 'absolute',
    borderRadius: 6,
    backgroundColor: '#38BDF8',
    borderColor: '#FACC15',
    borderWidth: 2,
    zIndex: 60,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  extraTurnFloatingBadge: {
    position: 'absolute',
    width: 170,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F1E36',
    borderWidth: 2.5,
    borderColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 1000,
  },
  extraTurnBadgeText: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  burstContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 95,
  },
  burstCircle: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  noticeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    height: 34,
  },
  noticeBannerHighlight: {
    backgroundColor: 'rgba(234, 179, 8, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 16,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  noticeTextHighlight: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  noticeBannerTurn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noticeTurnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bottomDocksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 62,
    marginVertical: 4,
    paddingBottom: 4,
    zIndex: 20,
  },
  bottomRollStation: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 2,
  },
  diceRollControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,

  },
  diceRollControlActive: {

    shadowOpacity: 0.8,
  },
  arrowIcon: {
    fontSize: 26,
    color: '#FACC15',
    fontWeight: '900',
  },
  diceRedBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE047',
  },
  diceRedBoxActive: {
    borderColor: '#FDE047',
    elevation: 6,
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  diceDiceEmoji: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
