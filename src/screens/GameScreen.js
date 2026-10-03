import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
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
import {
  BackArrowIcon,
  FriendsIcon,
  RobotIcon,
  SettingsGearIcon,
} from '../components/ui/AppIcons.js';

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
  const [rollNotice, setRollNotice] = useState(null);
  const [boardArea, setBoardArea] = useState({ width: 0, height: 0 });

  const bgColor = appTheme?.colors?.background || (isDarkMode ? '#050B14' : '#0B1A30');

  const boardSize = Math.max(
    0,
    Math.min(boardArea.width - 32, boardArea.height - 20, 360)
  );

  const [isAnimatingMove, setIsAnimatingMove] = useState(false);
  const isMovingLockRef = React.useRef(false);

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
    if (isAnimatingMove || isMovingLockRef.current) return;

    setRollNotice(null);

    setGameState((prevState) => {
      if (prevState.status !== 'WAITING_SELECT') return prevState;
      if (!prevState.movableTokenIds.includes(tokenId)) return prevState;

      const player = prevState.currentTurn;
      const playerTokens = prevState.tokens[player] || [];
      const token = playerTokens.find((t) => t.id === tokenId);
      if (!token) return prevState;

      isMovingLockRef.current = true;

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
        isMovingLockRef.current = false;
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
          isMovingLockRef.current = false;

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
        movableTokenIds: [],
      };
    });
  }, [isAnimatingMove, onGameOver]);

  // Handle dice roll
  const triggerRoll = React.useCallback(() => {
    if (isRolling || isAnimatingMove || isMovingLockRef.current || gameState.status !== 'ROLLING') {
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
      const isBotTurn = nextState.playerTypes?.[nextState.currentTurn] === 'bot';

      if (nextState.status === 'NO_MOVES') {
        setRollNotice(`❌ Rolled ${rolledVal} — No moves! Passing turn...`);
        setTimeout(() => {
          setRollNotice(null);
          setGameState((prev) => passTurn(prev));
          SoundFX.turnSwitch();
        }, 1000);
      } else if (nextState.movableTokenIds.length === 1 && isBotTurn) {
        // Auto-move single valid token only for BOT turns
        const singleTokenId = nextState.movableTokenIds[0];
        setRollNotice(`🎲 Rolled ${rolledVal}! Moving token...`);
        setTimeout(() => {
          handleSelectToken(singleTokenId);
        }, 220);
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
    if (gameState.currentTurn === player && gameState.diceValue) {
      return gameState.diceValue;
    }
    return lastDiceValues[player] || 6;
  };

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

  // Dock positioning: User at bottom, AI at top
  const is2Player = gameState.activePlayers.length === 2;
  const topPlayers = gameState.activePlayers.filter((p) => p !== userColor);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      {/* Top Header Row with Back Button, Room Mode Badge & Settings */}
      <View style={[styles.topHeader, { marginBottom: 15 }]}>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onExitHome}
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenSettings}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SettingsGearIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
          setBoardArea((current) => (
            current.width === width && current.height === height
              ? current
              : { width, height }
          ));
        }}
      >
        <LudoBoardExact
          state={gameState}
          onSelectToken={handleSelectToken}
          boardSize={boardSize}
          theme={settings?.ludoTheme || settings?.theme || 'classic'}
        />
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
    minHeight: 48,
  },
  boardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
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
    minHeight: 48,
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
