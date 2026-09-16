import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Modal,
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
import LudoBoardExact, { EXACT_COLORS } from '../components/board/LudoBoardExact.js';
import CornerPlayerDock from '../components/hud/CornerPlayerDock.js';
import { BackArrowIcon, SettingsGearIcon, TrophyIcon } from '../components/ui/AppIcons.js';

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
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Responsive board calculation
  const maxAvailableHeight = Math.max(260, screenHeight - 220);
  const boardSize = Math.min(screenWidth - 20, maxAvailableHeight, 370);

  // Sync sound
  useEffect(() => {
    SoundFX.setSoundEnabled(settings.sound !== false);
  }, [settings.sound]);

  const userColor = gameState.userColor || 'red';
  const turnColor = gameState.currentTurn;

  // Check if current turn belongs to a bot vs human
  const isAiTurn =
    (gameState.playerTypes
      ? gameState.playerTypes[turnColor] === 'bot'
      : gameState.isVsAi && turnColor !== userColor) &&
    gameState.status !== 'GAME_OVER';

  const isUserTurn = turnColor === userColor;
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
        setRollNotice(`❌ Rolled ${rolledVal} — No legal moves!`);
        setTimeout(() => {
          setRollNotice(null);
          setGameState((prev) => passTurn(prev));
          SoundFX.turnSwitch();
        }, 1600);
      } else {
        if (isSix) {
          setRollNotice('🎉 ROLLED A 6! Extra Turn + Unlock!');
        } else {
          setRollNotice(`🎲 ROLLED ${rolledVal}! Tap a pin to move`);
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
      setShowGameOverModal(true);
      recordGameResult({
        won: nextState.winners[0] === userColor,
        captures: nextState.stats[userColor]?.captures || 0,
        homeRuns: nextState.stats[userColor]?.homeCount || 0,
      });
    } else {
      SoundFX.turnSwitch();
    }
  }, [gameState, userColor]);

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

  // Get clear player label tags
  const getPlayerLabel = (color) => {
    if (color === userColor) return 'YOU';
    if (gameState.playerTypes?.[color] === 'bot') {
      const botsBefore = gameState.activePlayers
        .filter((c) => c !== userColor && gameState.playerTypes?.[c] === 'bot');
      const botIdx = botsBefore.indexOf(color);
      return `BOT ${botIdx + 1}`;
    }
    const humansBefore = gameState.activePlayers
      .filter((c) => c !== userColor && gameState.playerTypes?.[c] === 'human');
    const hIdx = humansBefore.indexOf(color);
    return `PLAYER ${hIdx + 2}`;
  };

  // Turn Indicator Banner Details
  const bannerInfo = (() => {
    const COLOR_NAMES = {
      red: 'RED',
      green: 'GREEN',
      yellow: 'YELLOW',
      blue: 'BLUE',
    };
    const colorHex = EXACT_COLORS[turnColor]?.base || '#EF4444';
    const colorName = COLOR_NAMES[turnColor] || 'RED';

    if (rollNotice) {
      return { text: rollNotice, color: '#FACC15', borderColor: '#FACC15' };
    }
    if (isRolling) {
      return { text: '🎲 ROLLING DICE...', color: '#38BDF8', borderColor: '#38BDF8' };
    }
    if (gameState.status === 'WAITING_SELECT') {
      if (isUserTurn) {
        return { text: '👉 YOUR TURN: TAP A HIGHLIGHTED PIN ON BOARD', color: '#34D399', borderColor: '#34D399' };
      }
      return { text: `🎯 ${getPlayerLabel(turnColor)} (${colorName}) CHOOSING PIN...`, color: colorHex, borderColor: colorHex };
    }
    if (isUserTurn) {
      return { text: `🎲 YOUR TURN! TAP 'ROLL DICE' BUTTON BELOW`, color: '#FACC15', borderColor: '#FACC15' };
    }
    return { text: `🤖 ${getPlayerLabel(turnColor)} (${colorName}) IS THINKING...`, color: colorHex, borderColor: colorHex };
  })();

  const bgColor = isDarkMode ? '#050B14' : '#071126';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      {/* Top Navigation Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onExitHome}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.modeHeaderBadge}>
          <Text style={styles.modeHeaderTitle}>
            {gameState.playerCount || 4} PLAYERS • {gameState.isVsAi ? '🤖 VS COMPUTER' : '👥 PASS & PLAY'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenSettings}
          style={styles.circleIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SettingsGearIcon size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Turn Status Banner */}
      <View style={[styles.turnBannerBox, { borderColor: bannerInfo.borderColor }]}>
        <Text style={[styles.turnBannerText, { color: bannerInfo.color }]}>
          {bannerInfo.text}
        </Text>
      </View>

      {/* Top Player Docks Row: Yellow (Left) | Green (Right) */}
      <View style={styles.topDocksRow}>
        {gameState.activePlayers.includes('yellow') ? (
          <CornerPlayerDock
            player="yellow"
            playerName={getPlayerLabel('yellow')}
            diceValue={turnColor === 'yellow' ? (gameState.diceValue || 6) : 6}
            isTurn={turnColor === 'yellow'}
            isRolling={isRolling && turnColor === 'yellow'}
            onRoll={triggerRoll}
            canRoll={canRoll && turnColor === 'yellow'}
            isBot={gameState.playerTypes?.yellow === 'bot'}
            layout="left-badge"
          />
        ) : <View />}

        {gameState.activePlayers.includes('green') ? (
          <CornerPlayerDock
            player="green"
            playerName={getPlayerLabel('green')}
            diceValue={turnColor === 'green' ? (gameState.diceValue || 6) : 6}
            isTurn={turnColor === 'green'}
            isRolling={isRolling && turnColor === 'green'}
            onRoll={triggerRoll}
            canRoll={canRoll && turnColor === 'green'}
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

      {/* Bottom Player Docks Row: Red (Left) | Blue (Right) */}
      <View style={styles.bottomDocksRow}>
        {gameState.activePlayers.includes('red') ? (
          <CornerPlayerDock
            player="red"
            playerName={getPlayerLabel('red')}
            diceValue={turnColor === 'red' ? (gameState.diceValue || 6) : 6}
            isTurn={turnColor === 'red'}
            isRolling={isRolling && turnColor === 'red'}
            onRoll={triggerRoll}
            canRoll={canRoll && turnColor === 'red'}
            isBot={gameState.playerTypes?.red === 'bot'}
            layout="left-badge"
          />
        ) : <View />}

        {gameState.activePlayers.includes('blue') ? (
          <CornerPlayerDock
            player="blue"
            playerName={getPlayerLabel('blue')}
            diceValue={turnColor === 'blue' ? (gameState.diceValue || 6) : 6}
            isTurn={turnColor === 'blue'}
            isRolling={isRolling && turnColor === 'blue'}
            onRoll={triggerRoll}
            canRoll={canRoll && turnColor === 'blue'}
            isBot={gameState.playerTypes?.blue === 'bot'}
            layout="right-badge"
          />
        ) : <View />}
      </View>

      {/* Bottom Center Active Rolling Station */}
      <View style={styles.bottomRollStation}>
        {canRoll ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={triggerRoll}
            style={[
              styles.rollBigBtn,
              { backgroundColor: EXACT_COLORS[turnColor]?.base || '#10B981' },
            ]}
          >
            <Text style={styles.rollBtnIcon}>🎲</Text>
            <Text style={styles.rollBtnText}>ROLL DICE NOW</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rollDisabledBar}>
            <Text style={styles.rollDisabledText}>
              {isRolling
                ? '🎲 Rolling Dice...'
                : isAiTurn
                ? `🤖 ${getPlayerLabel(turnColor)} Playing...`
                : '🎯 Select a Pin to Move'}
            </Text>
          </View>
        )}
      </View>

      {/* Victory / Game Over Modal */}
      <Modal visible={showGameOverModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TrophyIcon size={60} color="#F59E0B" />
            <Text style={styles.modalTitle}>
              {gameState.winners[0] === userColor ? '🎉 YOU WON!' : '🏆 GAME OVER!'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Winner: {getPlayerLabel(gameState.winners[0] || userColor)} ({gameState.winners[0]?.toUpperCase()})
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setShowGameOverModal(false);
                if (onGameOver) {
                  onGameOver({
                    winner: gameState.winners[0] || userColor,
                    coinsWon: 200,
                    opponent: 'Bot',
                  });
                } else {
                  onExitHome();
                }
              }}
              style={styles.modalBtn}
            >
              <Text style={styles.modalBtnText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071126',
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
  modeHeaderBadge: {
    backgroundColor: '#0F1E36',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  modeHeaderTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  turnBannerBox: {
    alignSelf: 'center',
    backgroundColor: '#0F1E36',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  turnBannerText: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  topDocksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 48,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  rollBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  rollBtnIcon: {
    fontSize: 18,
  },
  rollBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  rollDisabledBar: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F1E36',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollDisabledText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 17, 38, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0F1E36',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FACC15',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FACC15',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 20,
  },
  modalBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
