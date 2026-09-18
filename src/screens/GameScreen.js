import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createInitialState,
  rollDice,
  moveToken,
  passTurn,
} from '../ludo/LudoEngine.js';
import { chooseBestTokenToMove } from '../ludo/LudoAI.js';
import { SoundFX } from '../utils/soundFX.js';
import { recordGameResult } from '../utils/storage.js';
import LudoBoardExact from '../components/board/LudoBoardExact.js';
import CornerPlayerDock from '../components/hud/CornerPlayerDock.js';
import Cube3DFlippingDice from '../components/3d/Cube3DFlippingDice.js';
import { useTheme } from '../context/ThemeContext.js';
import { BackArrowIcon, SettingsGearIcon } from '../components/ui/AppIcons.js';

export default function GameScreen({
  gameOptions = {},
  onExitHome,
  onOpenSettings,
  onGameOver,
  settings = {},
  isDarkMode = false,
}) {
  const { appTheme } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [gameState, setGameState] = useState(() => createInitialState(gameOptions));
  const [isRolling, setIsRolling] = useState(false);
  const [rollNotice, setRollNotice] = useState(null);

  const bgColor = appTheme?.colors?.background || (isDarkMode ? '#050B14' : '#0B1A30');

  // Fully responsive board sizing based on available height and screen width
  const isSmallHeight = screenHeight < 680;
  const reservedHudHeight = isSmallHeight ? 230 : 260;
  const maxAvailableHeight = Math.max(200, screenHeight - reservedHudHeight);
  const maxAvailableWidth = Math.max(200, screenWidth - 16);
  const boardSize = Math.min(maxAvailableWidth, maxAvailableHeight, 370);

  const [isAnimatingMove, setIsAnimatingMove] = useState(false);

  // Sync sound setting
  useEffect(() => {
    SoundFX.setSoundEnabled(settings.sound !== false);
  }, [settings.sound]);

  // Check if current turn belongs to a bot
  const isAiTurn =
    (gameState.playerTypes
      ? gameState.playerTypes[gameState.currentTurn] === 'bot'
      : gameState.isVsAi && gameState.currentTurn !== 'red') &&
    gameState.status !== 'GAME_OVER' &&
    !isAnimatingMove;

  const canRoll = !isRolling && !isAnimatingMove && gameState.status === 'ROLLING' && !isAiTurn;

  // Handle token selection with step-by-step 1-by-1 box jumping animation
  const handleSelectToken = React.useCallback((tokenId) => {
    if (isAnimatingMove) return;

    setRollNotice(null);

    setGameState((prevState) => {
      if (prevState.status !== 'WAITING_SELECT') return prevState;
      if (!prevState.movableTokenIds.includes(tokenId)) return prevState;

      const player = prevState.currentTurn;
      const playerTokens = prevState.tokens[player] || [];
      const token = playerTokens.find((t) => t.id === tokenId);
      if (!token) return prevState;

      const startStep = token.step;
      const diceVal = prevState.diceValue || 0;

      // Calculate final state from engine
      const finalState = moveToken(prevState, tokenId);
      const updatedToken = (finalState.tokens[player] || []).find((t) => t.id === tokenId);
      const finalStep = updatedToken ? updatedToken.step : (startStep === -1 ? 0 : startStep + diceVal);

      // Build step-by-step sequence of steps
      const stepsPath = [];
      if (startStep === -1) {
        stepsPath.push(0);
      } else {
        for (let s = startStep + 1; s <= finalStep; s++) {
          stepsPath.push(s);
        }
      }

      if (stepsPath.length === 0) {
        return finalState;
      }

      setIsAnimatingMove(true);

      let stepIndex = 0;

      const runStepAnimation = () => {
        if (stepIndex < stepsPath.length) {
          const stepVal = stepsPath[stepIndex];
          stepIndex++;

          SoundFX.hop();

          setGameState((animState) => {
            const newTokens = { ...animState.tokens };
            const pTokens = [...(newTokens[player] || [])];
            const tIdx = pTokens.findIndex((t) => t.id === tokenId);
            if (tIdx !== -1) {
              pTokens[tIdx] = {
                ...pTokens[tIdx],
                step: stepVal,
                isHome: stepVal === 56,
              };
              newTokens[player] = pTokens;
            }
            return {
              ...animState,
              tokens: newTokens,
              status: 'ANIMATING',
            };
          });

          setTimeout(runStepAnimation, 110);
        } else {
          // Finish stepping animation -> apply final calculated state
          setGameState(finalState);
          setIsAnimatingMove(false);

          if (finalState.status === 'GAME_OVER') {
            SoundFX.victory();
            recordGameResult({
              won: finalState.winners[0] === 'red',
              captures: finalState.stats.red?.captures || 0,
              homeRuns: finalState.stats.red?.homeCount || 0,
            });
            setTimeout(() => {
              onGameOver?.({
                winner: finalState.winners[0] || 'red',
                coinsWon: 200,
                opponent: 'Player 3',
              });
            }, 800);
          } else if (finalState.lastEvent && finalState.lastEvent.includes('Captured')) {
            SoundFX.capture();
          } else {
            SoundFX.turnSwitch();
          }
        }
      };

      // Trigger first step after a short tick
      setTimeout(runStepAnimation, 20);

      return {
        ...prevState,
        status: 'ANIMATING',
      };
    });
  }, [isAnimatingMove, onGameOver]);

  // Handle dice roll
  const triggerRoll = React.useCallback(() => {
    if (isRolling || isAnimatingMove || gameState.status !== 'ROLLING') {
      return;
    }

    SoundFX.dice();
    setIsRolling(true);
    setRollNotice(null);

    const nextState = rollDice(gameState);

    // Fast Roll animation delay (320ms)
    setTimeout(() => {
      setGameState(nextState);
      setIsRolling(false);

      const rolledVal = nextState.diceValue;
      const isSix = rolledVal === 6;

      if (nextState.status === 'NO_MOVES') {
        setRollNotice(`❌ Rolled ${rolledVal} — No moves! Passing turn...`);
        setTimeout(() => {
          setRollNotice(null);
          setGameState((prev) => passTurn(prev));
          SoundFX.turnSwitch();
        }, 1000);
      } else if (nextState.movableTokenIds.length === 1) {
        // Auto-move single valid token for smooth gameplay
        const singleTokenId = nextState.movableTokenIds[0];
        setRollNotice(`🎲 Rolled ${rolledVal}! Moving token...`);
        setTimeout(() => {
          handleSelectToken(singleTokenId);
        }, 180);
      } else {
        if (isSix) {
          setRollNotice('🎉 Rolled a 6! Tap a token to move!');
        } else {
          setRollNotice(`🎲 Rolled ${rolledVal}! Tap a token to move`);
        }
      }
    }, 320);
  }, [isRolling, isAnimatingMove, gameState, handleSelectToken]);

  // AI automation loop
  useEffect(() => {
    let timer = null;

    if (isAiTurn && !isAnimatingMove) {
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
  }, [gameState, isAiTurn, isRolling, isAnimatingMove, rollNotice, triggerRoll, handleSelectToken, settings.aiDifficulty]);

  const userColor = gameState.userColor || gameOptions.userColor || 'red';

  const PLAYER_HEX = {
    red: '#EF4444',
    green: '#10B981',
    yellow: '#F59E0B',
    blue: '#3B82F6',
  };

  const getPlayerLabel = (color) => {
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
  };

  const activeTurnColor = PLAYER_HEX[gameState.currentTurn] || '#EF4444';
  const playerTurnName = getPlayerLabel(gameState.currentTurn || 'red').toUpperCase();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      {/* Top Header Row with Back Button, Room Mode Badge & Settings */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onExitHome}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.matchModeText}>
            {gameOptions.isVsAi ? '🤖 VS AI' : '👥 PASS & PLAY'} • {gameState.activePlayers?.length || gameOptions.playerCount || 4} PLAYERS
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenSettings}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SettingsGearIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Top Player Docks Row:
          - Left: Green (Player 2 / Computer 2)
          - Right: Yellow (Player 3 / Computer 3)
      */}
      <View style={styles.topDocksRow}>
        {gameState.activePlayers.includes('green') ? (
          <CornerPlayerDock
            player="green"
            playerName={getPlayerLabel('green')}
            diceValue={gameState.currentTurn === 'green' ? (gameState.diceValue || 6) : 6}
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
            diceValue={gameState.currentTurn === 'yellow' ? (gameState.diceValue || 6) : 6}
            isTurn={gameState.currentTurn === 'yellow'}
            isRolling={isRolling && gameState.currentTurn === 'yellow'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'yellow'}
            isBot={gameState.playerTypes?.yellow === 'bot'}
            layout="right-badge"
          />
        ) : <View />}
      </View>

      {/* Center Ludo Board */}
      <View style={styles.boardContainer}>
        <LudoBoardExact
          state={gameState}
          onSelectToken={handleSelectToken}
          boardSize={boardSize}
          theme={settings?.ludoTheme || settings?.theme || 'galaxy'}
        />
      </View>

      {/* Roll Notice & Turn Status Banner */}


      {/* Bottom Player Docks Row:
          - Left: Red (Player 1)
          - Right: Blue (Player 4)
      */}
      <View style={styles.bottomDocksRow}>
        {gameState.activePlayers.includes('red') ? (
          <CornerPlayerDock
            player="red"
            playerName={getPlayerLabel('red')}
            diceValue={gameState.currentTurn === 'red' ? (gameState.diceValue || 6) : 6}
            isTurn={gameState.currentTurn === 'red'}
            isRolling={isRolling && gameState.currentTurn === 'red'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'red'}
            isBot={gameState.playerTypes?.red === 'bot'}
            layout="left-badge"
          />
        ) : <View />}

        {gameState.activePlayers.includes('blue') ? (
          <CornerPlayerDock
            player="blue"
            playerName={getPlayerLabel('blue')}
            diceValue={gameState.currentTurn === 'blue' ? (gameState.diceValue || 6) : 6}
            isTurn={gameState.currentTurn === 'blue'}
            isRolling={isRolling && gameState.currentTurn === 'blue'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'blue'}
            isBot={gameState.playerTypes?.blue === 'bot'}
            layout="right-badge"
          />
        ) : <View />}
      </View>

      {/* Bottom Center Active Rolling Station with 3D Flipping Cube */}
      <View style={styles.bottomRollStation}>
        <View style={[styles.diceRollControl, canRoll && styles.diceRollControlActive]}>
          <Text style={styles.arrowIcon}>‹</Text>
          <Cube3DFlippingDice
            targetValue={gameState.diceValue || 6}
            isRolling={isRolling}
            onPress={canRoll ? triggerRoll : undefined}
            disabled={!canRoll}
            size={50}
            themeColor={activeTurnColor}
          />
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </View>
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
  circleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
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
    minHeight: 52,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  noticeBanner: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FACC15',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  noticeBannerTurn: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 14,
    alignSelf: 'center',
  },
  noticePlaceholder: {
    height: 24,
  },
  noticeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  noticeTurnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomDocksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  bottomRollStation: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
  },
  diceRollControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1D38',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38BDF8',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  diceRollControlActive: {
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
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
