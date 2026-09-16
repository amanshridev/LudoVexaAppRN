import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
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
import { BackArrowIcon, SettingsGearIcon } from '../components/ui/AppIcons.js';

export default function GameScreen({
  gameOptions = {},
  onExitHome,
  onOpenSettings,
  onGameOver,
  settings = {},
  isDarkMode = false,
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [gameState, setGameState] = useState(() => createInitialState(gameOptions));
  const [isRolling, setIsRolling] = useState(false);
  const [rollNotice, setRollNotice] = useState(null);

  // Responsive board calculation to match screenshot
  const maxAvailableHeight = Math.max(260, screenHeight - 210);
  const boardSize = Math.min(screenWidth - 24, maxAvailableHeight, 370);

  // Sync sound
  useEffect(() => {
    SoundFX.setSoundEnabled(settings.sound !== false);
  }, [settings.sound]);

  // Check if current turn belongs to a bot
  const isAiTurn =
    (gameState.playerTypes
      ? gameState.playerTypes[gameState.currentTurn] === 'bot'
      : gameState.isVsAi && gameState.currentTurn !== 'red') &&
    gameState.status !== 'GAME_OVER';

  const canRoll = !isRolling && gameState.status === 'ROLLING' && !isAiTurn;

  // Handle dice roll
  const triggerRoll = React.useCallback(() => {
    if (isRolling || gameState.status !== 'ROLLING') {
      return;
    }

    SoundFX.dice();
    setIsRolling(true);
    setRollNotice(null);

    const nextState = rollDice(gameState);

    // Roll duration
    setTimeout(() => {
      setGameState(nextState);
      setIsRolling(false);

      const rolledVal = nextState.diceValue;
      const isSix = rolledVal === 6;

      if (nextState.status === 'NO_MOVES') {
        setRollNotice(`❌ Rolled ${rolledVal} — No moves!`);
        setTimeout(() => {
          setRollNotice(null);
          setGameState((prev) => passTurn(prev));
          SoundFX.turnSwitch();
        }, 1800);
      } else {
        if (isSix) {
          setRollNotice('🎉 Rolled a 6! Extra turn + unlock!');
        } else {
          setRollNotice(`🎲 Rolled ${rolledVal}! Tap a pin to move`);
        }
      }
    }, 600);
  }, [isRolling, gameState]);

  // Handle token selection
  const handleSelectToken = React.useCallback((tokenId) => {
    if (gameState.status !== 'WAITING_SELECT') {
      return;
    }
    if (!gameState.movableTokenIds.includes(tokenId)) {
      return;
    }

    SoundFX.hop();
    setRollNotice(null);
    const nextState = moveToken(gameState, tokenId);
    setGameState(nextState);

    if (nextState.status === 'GAME_OVER') {
      SoundFX.victory();
      recordGameResult({
        won: nextState.winners[0] === 'red',
        captures: nextState.stats.red?.captures || 0,
        homeRuns: nextState.stats.red?.homeCount || 0,
      });
      setTimeout(() => {
        onGameOver?.({
          winner: nextState.winners[0] || 'red',
          coinsWon: 200,
          opponent: 'Player 3',
        });
      }, 1000);
    } else {
      SoundFX.turnSwitch();
    }
  }, [gameState, onGameOver]);

  // AI automation loop
  useEffect(() => {
    let timer = null;

    if (isAiTurn) {
      if (gameState.status === 'ROLLING' && !isRolling && !rollNotice) {
        timer = setTimeout(() => {
          triggerRoll();
        }, 900);
      } else if (gameState.status === 'WAITING_SELECT' && !isRolling) {
        timer = setTimeout(() => {
          const bestTokenId = chooseBestTokenToMove(
            gameState,
            settings.aiDifficulty || 'medium'
          );
          if (bestTokenId) {
            handleSelectToken(bestTokenId);
          }
        }, 1200);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [gameState, isAiTurn, isRolling, rollNotice, triggerRoll, handleSelectToken, settings.aiDifficulty]);

  const bgColor = isDarkMode ? '#050B14' : '#0B1A30';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />


      <View style={styles.topHeader}>


        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenSettings}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SettingsGearIcon size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Top Player Docks Row:
          - Left: Player 2 (Yellow)
          - Right: Player 3 (Green)
      */}
      <View style={styles.topDocksRow}>
        {gameState.activePlayers.includes('yellow') ? (
          <CornerPlayerDock
            player="yellow"
            diceValue={gameState.currentTurn === 'yellow' ? (gameState.diceValue || 2) : 2}
            isTurn={gameState.currentTurn === 'yellow'}
            isRolling={isRolling && gameState.currentTurn === 'yellow'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'yellow'}
            isBot={gameState.playerTypes?.yellow === 'bot'}
            layout="left-badge"
          />
        ) : <View />}

        {gameState.activePlayers.includes('green') ? (
          <CornerPlayerDock
            player="green"
            diceValue={gameState.currentTurn === 'green' ? (gameState.diceValue || 3) : 3}
            isTurn={gameState.currentTurn === 'green'}
            isRolling={isRolling && gameState.currentTurn === 'green'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'green'}
            isBot={gameState.playerTypes?.green === 'bot'}
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
        />
      </View>

      {/* Roll Notice Banner */}
      {rollNotice ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>{rollNotice}</Text>
        </View>
      ) : (
        <View style={styles.noticePlaceholder} />
      )}

      {/* Bottom Player Docks Row:
          - Left: Player 1 (Red)
          - Right: Player 4 (Blue)
      */}
      <View style={styles.bottomDocksRow}>
        <CornerPlayerDock
          player="red"
          diceValue={gameState.currentTurn === 'red' ? (gameState.diceValue || 5) : 5}
          isTurn={gameState.currentTurn === 'red'}
          isRolling={isRolling && gameState.currentTurn === 'red'}
          onRoll={triggerRoll}
          canRoll={canRoll && gameState.currentTurn === 'red'}
          isBot={gameState.playerTypes?.red === 'bot'}
          layout="left-badge"
        />

        {gameState.activePlayers.includes('blue') ? (
          <CornerPlayerDock
            player="blue"
            diceValue={gameState.currentTurn === 'blue' ? (gameState.diceValue || 4) : 4}
            isTurn={gameState.currentTurn === 'blue'}
            isRolling={isRolling && gameState.currentTurn === 'blue'}
            onRoll={triggerRoll}
            canRoll={canRoll && gameState.currentTurn === 'blue'}
            isBot={gameState.playerTypes?.blue === 'bot'}
            layout="right-badge"
          />
        ) : <View />}
      </View>

      {/* Bottom Center Active Rolling Station matching screenshot: < [ 🎲 ] > */}
      <View style={styles.bottomRollStation}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!canRoll && gameState.currentTurn !== 'red'}
          onPress={triggerRoll}
          style={[
            styles.diceRollControl,
            gameState.currentTurn === 'red' && styles.diceRollControlActive,
          ]}
        >
          <Text style={styles.arrowIcon}>‹</Text>
          <View style={styles.diceRedBox}>
            <Text style={styles.diceDiceEmoji}>
              {isRolling ? '🎲' : gameState.diceValue || 5}
            </Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
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
  diceDiceEmoji: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
