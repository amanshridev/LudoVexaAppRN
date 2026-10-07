import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

const PLAYER_HEX = Object.freeze({
  red: '#EF4444',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6',
});

const ICON_BTN_HIT_SLOP = Object.freeze({ top: 10, bottom: 10, left: 10, right: 10 });

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

  // Pre-initialize board dimensions from screen width/height so frame 0 renders immediately
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
  const ghostPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ghostLift = useRef(new Animated.Value(0)).current;
  const ghostScale = useRef(new Animated.Value(1)).current;
  const isAnimatingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Timer ref tracker for memory safety
  const timersRef = useRef([]);

  const addTimeout = useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Winner Celebration Overlay State & Ref
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const hasShownWinnerRef = useRef(false);

  // Stage 3: Effect state and animated refs
  const [capturedAnimToken, setCapturedAnimToken] = useState(null);
  const capturedGhostPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const capturedGhostLift = useRef(new Animated.Value(0)).current;
  const capturedGhostScale = useRef(new Animated.Value(1)).current;
  const capturedShake = useRef(new Animated.Value(0)).current;

  const [captureRing, setCaptureRing] = useState(null);
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  const [safeGlow, setSafeGlow] = useState(null);
  const safeGlowOpacity = useRef(new Animated.Value(0)).current;

  const [showExtraTurn, setShowExtraTurn] = useState(false);
  const extraTurnAnim = useRef(new Animated.Value(0)).current;
  const extraTurnScale = useRef(new Animated.Value(0.5)).current;

  const [finishedBurst, setFinishedBurst] = useState(null);
  const burstProgress = useRef(new Animated.Value(0)).current;

  // Sound state and SoundManager lifecycle
  const [isMuted, setIsMuted] = useState(settings.sound === false);

  const userColor = gameState.userColor || gameOptions.userColor || 'red';

  useEffect(() => {
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

  const toggleSoundMute = useCallback(() => {
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
      clearAllTimeouts();
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
    clearAllTimeouts,
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
  const isAiTurn = useMemo(() => {
    return (
      (gameState.playerTypes
        ? gameState.playerTypes[gameState.currentTurn] === 'bot'
        : gameState.isVsAi && gameState.currentTurn !== 'red') &&
      gameState.status !== 'GAME_OVER' &&
      !isAnimatingRef.current
    );
  }, [gameState.playerTypes, gameState.currentTurn, gameState.isVsAi, gameState.status]);

  const canRoll = useMemo(() => {
    return !isRolling && !isAnimatingRef.current && gameState.status === 'ROLLING' && !isAiTurn;
  }, [isRolling, gameState.status, isAiTurn]);

  // Board state hiding both moving token and captured token during animations
  const displayedState = useMemo(() => {
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
  const animateMove = useCallback(async (tokenId, color, cells, oldCoord) => {
    if (!isMountedRef.current || cells.length === 0) return;

    const startXY = getCoordXY(oldCoord, cellSize);
    ghostPos.setValue(startXY);
    ghostLift.setValue(0);
    ghostScale.setValue(1);

    setMovingToken({ tokenId, color });

    await new Promise((resolve) => setTimeout(resolve, 20));

    for (let i = 0; i < cells.length; i++) {
      if (!isMountedRef.current) break;

      const cell = cells[i];
      try {
        const stepRate = Math.min(1.5, 1.0 + i * 0.05);
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

  // Capture Effect
  const runCaptureEffect = useCallback(async (capturedToken, finalCoord) => {
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

    addTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        const isVictimMine = capturedToken.player === userColor;
        SoundManager.play(isVictimMine ? 'killedMine' : 'killed', { volume: 0.85 });
      } catch (_) { }
    }, 100);

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
  }, [cellSize, ghostScale, ringScale, ringOpacity, capturedGhostPos, capturedGhostLift, capturedGhostScale, capturedShake, userColor, addTimeout]);

  // Safe Cell Effect
  const runSafeCellEffect = useCallback(async (finalCoord) => {
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

  // Extra Turn Badge
  const runExtraTurnBadge = useCallback(async () => {
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

  // Token Finished Effect
  const runTokenFinishedEffect = useCallback(async (centerCoord, playerColor) => {
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

  const getPlayerLabel = useCallback((color) => {
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

  // Persistent last rolled dice values per player
  const [lastDiceValues, setLastDiceValues] = useState({});

  useEffect(() => {
    if (gameState.diceValue != null && gameState.diceValue >= 1 && gameState.diceValue <= 6) {
      setLastDiceValues((prev) => ({
        ...prev,
        [gameState.currentTurn]: gameState.diceValue,
      }));
    }
  }, [gameState.diceValue, gameState.currentTurn]);

  const getPlayerDiceValue = useCallback((player) => {
    if (gameState.currentTurn === player) {
      if (rollingDiceValue != null) return rollingDiceValue;
      if (gameState.diceValue) return gameState.diceValue;
    }
    return lastDiceValues[player] || 6;
  }, [gameState.currentTurn, gameState.diceValue, rollingDiceValue, lastDiceValues]);

  // Restart match
  const handleRestartGame = useCallback(() => {
    hasShownWinnerRef.current = false;
    setShowWinnerOverlay(false);
    setWinnerData(null);
    clearAllTimeouts();

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
  }, [gameOptions, clearAllTimeouts]);

  // Exit home
  const handleWinnerHome = useCallback(() => {
    hasShownWinnerRef.current = false;
    setShowWinnerOverlay(false);
    setWinnerData(null);
    clearAllTimeouts();
    onExitHome?.();
  }, [onExitHome, clearAllTimeouts]);

  // Handle token selection
  const handleSelectToken = useCallback(async (tokenId) => {
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

    const safetyTimeout = addTimeout(() => {
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

      const finalState = moveToken(gameState, tokenId);
      const updatedToken = (finalState.tokens[player] || []).find((t) => t.id === tokenId);
      const finalStep = updatedToken ? updatedToken.step : (startStep === -1 ? 0 : startStep + diceVal);

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
          // Hop animation fallback
        }
      }

      const finalCoord = getTokenCoordinates({ player, step: finalStep, index: token.index });

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

      const finalTrackIdx = (finalStep >= 0 && finalStep <= 50) ? getTrackIndex(player, finalStep) : -1;
      const isSafeCell = SAFE_INDICES.includes(finalTrackIdx) && !capturedToken;
      const isFinished = updatedToken?.isHome || finalStep === HOME_STEP;
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
      } catch (_) { }

      if (isMountedRef.current) {
        setGameState(finalState);

        if (finalState.status === 'GAME_OVER') {
          try {
            SoundManager.play('winner', { volume: 1.0 });
            SoundFX.victory();
          } catch (_) { }

          recordGameResult({
            won: finalState.winners[0] === 'red',
            captures: finalState.stats.red?.captures || 0,
            homeRuns: finalState.stats.red?.homeCount || 0,
          });

          if (!hasShownWinnerRef.current) {
            hasShownWinnerRef.current = true;
            const winnerColor = finalState.winners[0] || 'red';
            const winnerName = getPlayerLabel(winnerColor);
            const isUserWinner = winnerColor === userColor;

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
        } else if (!finalState.lastEvent || !finalState.lastEvent.includes('Captured')) {
          try {
            SoundManager.play('turnChange', { volume: 0.25 });
            SoundFX.turnSwitch();
          } catch (_) { }
        }
      }
    } catch (err) {
      // Handle error gracefully
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
    addTimeout,
  ]);

  // Handle dice roll
  const triggerRoll = useCallback(() => {
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

    addTimeout(() => {
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
        addTimeout(() => {
          if (!isMountedRef.current) return;
          setRollNotice(null);
          setGameState((prev) => passTurn(prev));
          try {
            SoundManager.play('turnChange');
            SoundFX.turnSwitch();
          } catch (_) { }
        }, 1000);
      } else if (nextState.movableTokenIds.length === 1 && isBotTurn) {
        const singleTokenId = nextState.movableTokenIds[0];
        setRollNotice(`🎲 Rolled ${rolledVal}! Moving token...`);
        addTimeout(() => {
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
  }, [isRolling, gameState, handleSelectToken, addTimeout]);

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

  // Memoized token objects for overlays
  const movingTokenData = useMemo(() => {
    if (!movingToken) return null;
    return { id: movingToken.tokenId, player: movingToken.color };
  }, [movingToken]);

  const capturedAnimTokenData = useMemo(() => {
    if (!capturedAnimToken) return null;
    return { id: capturedAnimToken.tokenId, player: capturedAnimToken.color };
  }, [capturedAnimToken]);

  const is2Player = gameState.activePlayers.length === 2;
  const topPlayers = useMemo(() => gameState.activePlayers.filter((p) => p !== userColor), [gameState.activePlayers, userColor]);

  // Pre-calculate particle burst interpolate configurations
  const burstTransforms = useMemo(() => {
    return BURST_ANGLES.map((angle) => {
      const dist = cellSize * 1.25;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      return {
        dx,
        dy,
        translateX: burstProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, dx],
        }),
        translateY: burstProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, dy],
        }),
        opacity: burstProgress.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 0.8, 0],
        }),
        scale: burstProgress.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0.6, 1.3, 0.2],
        }),
      };
    });
  }, [cellSize, burstProgress]);

  const handleBoardLayout = useCallback(({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout;
    if (width > 0 && height > 0) {
      setBoardArea((current) => {
        if (Math.abs(current.width - width) < 3 && Math.abs(current.height - height) < 3) {
          return current;
        }
        return { width, height };
      });
    }
  }, []);

  const handleBackPress = useCallback(() => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    onExitHome?.();
  }, [onExitHome]);

  const handleSettingsPress = useCallback(() => {
    try {
      SoundManager.play('buttonTap');
    } catch (_) { }
    onOpenSettings?.();
  }, [onOpenSettings]);

  const handleFallbackGameOver = useCallback(() => {
    if (winnerData) {
      onGameOver?.({
        winner: winnerData.winnerColor,
        coinsWon: winnerData.coinsWon,
        opponent: 'Player 3',
      });
    }
  }, [winnerData, onGameOver]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      {/* Header */}
      <View style={[styles.topHeader, { marginBottom: 15 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBackPress}
          style={styles.circleIconBtn}
          hitSlop={ICON_BTN_HIT_SLOP}
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
            onPress={handleSettingsPress}
            style={styles.circleIconBtn}
            hitSlop={ICON_BTN_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <SettingsGearIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Docks Row */}
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

      {/* Center Ludo Board */}
      <View style={styles.boardContainer} onLayout={handleBoardLayout}>
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
          {movingTokenData && (
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
                token={movingTokenData}
                size={cellSize * 0.72}
                isMovable={false}
              />
            </Animated.View>
          )}

          {/* Captured Ghost Token Overlay */}
          {capturedAnimTokenData && (
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
                token={capturedAnimTokenData}
                size={cellSize * 0.72}
                isMovable={false}
              />
            </Animated.View>
          )}

          {/* Token Finished Particle Burst */}
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
              {burstTransforms.map((t, idx) => (
                <Animated.View
                  key={`burst_${idx}`}
                  style={[
                    styles.burstCircle,
                    {
                      backgroundColor: idx % 2 === 0 ? '#FACC15' : '#38BDF8',
                      opacity: t.opacity,
                      transform: [
                        { translateX: t.translateX },
                        { translateY: t.translateY },
                        { scale: t.scale },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Extra Turn Floating Badge */}
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

      {/* Bottom Docks Row */}
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

      {/* Winner Celebration Overlay */}
      {showWinnerOverlay && winnerData && (
        <WinnerErrorBoundary
          fallbackOnGameOver={handleFallbackGameOver}
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

