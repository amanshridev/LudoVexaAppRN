import {
  PLAYER_ORDER,
  PLAYER_CONFIG,
  TRACK_COORDS,
  SAFE_INDICES,
  HOME_STEP,
} from './LudoConstants.js';
import { getPowerAtTrackIndex } from './PowerTiles.js';

export function createInitialState(options = {}) {
  const userColor = options.userColor || 'red';
  const playerCount = options.playerCount || 4;
  const gameMode = options.gameMode || 'classic'; // 'classic' | 'power' | 'rush'
  const isVsAi = options.isVsAi !== undefined ? options.isVsAi : true;

  const OPPOSITE = {
    red: 'yellow',
    yellow: 'red',
    green: 'blue',
    blue: 'green',
  };

  let activePlayers = [];
  if (playerCount === 2) {
    activePlayers = [userColor, OPPOSITE[userColor] || 'yellow'];
  } else if (playerCount === 3) {
    const startIdx = PLAYER_ORDER.indexOf(userColor);
    const validIdx = startIdx >= 0 ? startIdx : 0;
    activePlayers = [
      PLAYER_ORDER[validIdx],
      PLAYER_ORDER[(validIdx + 1) % 4],
      PLAYER_ORDER[(validIdx + 2) % 4],
    ];
  } else {
    activePlayers = ['red', 'green', 'yellow', 'blue'];
  }

  const tokens = {};
  activePlayers.forEach((player) => {
    tokens[player] = [0, 1, 2, 3].map((idx) => ({
      id: `${player}_${idx}`,
      player,
      index: idx,
      step: -1, // -1 is base
      isHome: false,
      shield: false,
    }));
  });

  const playerTypes = options.playerTypes || {
    red: isVsAi ? (userColor === 'red' ? 'human' : 'bot') : 'human',
    green: isVsAi ? (userColor === 'green' ? 'human' : 'bot') : 'human',
    yellow: isVsAi ? (userColor === 'yellow' ? 'human' : 'bot') : 'human',
    blue: isVsAi ? (userColor === 'blue' ? 'human' : 'bot') : 'human',
  };

  return {
    gameMode,
    isVsAi,
    userColor,
    playerTypes,
    playerCount,
    activePlayers,
    tokens,
    currentTurnIndex: 0,
    currentTurn: activePlayers[0],
    diceValue: null,
    hasRolled: false,
    consecutiveSixes: 0,
    movableTokenIds: [],
    winners: [],
    status: 'ROLLING', // 'ROLLING' | 'WAITING_SELECT' | 'GAME_OVER'
    lastEvent: 'Game started. Roll the 3D dice to begin!',
    rollsWithoutSix: {
      red: 0,
      green: 0,
      yellow: 0,
      blue: 0,
    },
    turnCounts: {
      red: 0,
      green: 0,
      yellow: 0,
      blue: 0,
    },
    stats: {
      red: { captures: 0, homeCount: 0 },
      green: { captures: 0, homeCount: 0 },
      yellow: { captures: 0, homeCount: 0 },
      blue: { captures: 0, homeCount: 0 },
    },
  };
}

/**
 * Smart dynamic dice generator with opening pity protection and drought prevention.
 * Solves the issue in 4-player matches where players get stuck for many turns waiting for 6.
 */
export function generateFairDiceValue(state, player) {
  const playerTokens = (state.tokens && state.tokens[player]) || [];
  const inBaseCount = playerTokens.filter((t) => t.step === -1).length;
  const inPlayCount = playerTokens.filter((t) => t.step >= 0 && !t.isHome).length;
  const drought = (state.rollsWithoutSix && state.rollsWithoutSix[player]) || 0;
  const isHuman = state.playerTypes ? state.playerTypes[player] === 'human' : player === state.userColor;
  const consecutiveSixes = state.consecutiveSixes || 0;

  // 1. If player already rolled 2 consecutive sixes, keep 3rd six probability low (6%) to avoid penalty
  if (consecutiveSixes >= 2) {
    if (Math.random() < 0.06) return 6;
    const others = [1, 2, 3, 4, 5];
    return others[Math.floor(Math.random() * others.length)];
  }

  // 2. If player just rolled a six, standard chance of rolling a second consecutive six (~16%)
  if (consecutiveSixes === 1) {
    if (Math.random() < 0.16) return 6;
    const others = [1, 2, 3, 4, 5];
    return others[Math.floor(Math.random() * others.length)];
  }

  // 3. Dynamic bad-luck protection & opening curve
  let pSix = 0.1667; // baseline 1/6

  if (inPlayCount === 0 && inBaseCount > 0) {
    // CRITICAL: Player has NO tokens on the board (all remaining tokens locked in yard).
    // In a 4-player game, sitting for multiple rounds with 0 moves feels terrible.
    // Pity curve guarantees unlocking within 3-4 turns max.
    if (drought === 0) {
      pSix = isHuman ? 0.42 : 0.36; // High chance on opening turn so matches start immediately
    } else if (drought === 1) {
      pSix = isHuman ? 0.65 : 0.55; // 2nd turn
    } else if (drought === 2) {
      pSix = isHuman ? 0.85 : 0.80; // 3rd turn
    } else {
      pSix = 1.0; // 4th turn: 100% GUARANTEED 6
    }
  } else if (inBaseCount > 0) {
    // Player has pieces in play, but also pieces waiting in yard
    if (drought < 3) {
      pSix = 0.22; // Slightly boosted to keep game lively
    } else if (drought < 5) {
      pSix = 0.35;
    } else if (drought < 7) {
      pSix = 0.55;
    } else if (drought === 7) {
      pSix = 0.80;
    } else {
      pSix = 1.0; // Guaranteed 6 on 8th attempt without a six
    }
  } else {
    // All tokens are already on the board/finished
    if (drought < 4) {
      pSix = 0.18;
    } else if (drought < 6) {
      pSix = 0.32;
    } else if (drought < 8) {
      pSix = 0.55;
    } else {
      pSix = 1.0; // Guaranteed
    }
  }

  if (Math.random() < pSix) {
    return 6;
  }

  const pool = [1, 2, 3, 4, 5];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rollDice(state, forcedValue = null) {
  if (state.hasRolled && state.movableTokenIds.length > 0) {
    return state; // Must move token first
  }

  const player = state.currentTurn;
  const diceVal = forcedValue || generateFairDiceValue(state, player);
  let consecutiveSixes = diceVal === 6 ? (state.consecutiveSixes || 0) + 1 : 0;

  const currentDrought = (state.rollsWithoutSix && state.rollsWithoutSix[player]) || 0;
  const updatedDrought = diceVal === 6 ? 0 : currentDrought + 1;
  const updatedRollsWithoutSix = {
    ...(state.rollsWithoutSix || {}),
    [player]: updatedDrought,
  };
  const updatedTurnCounts = {
    ...(state.turnCounts || {}),
    [player]: ((state.turnCounts && state.turnCounts[player]) || 0) + 1,
  };

  // Penalty rule for 3 consecutive sixes
  if (consecutiveSixes === 3) {
    const nextPlayer = getNextPlayer(state);
    return {
      ...state,
      diceValue: 6,
      hasRolled: false,
      consecutiveSixes: 0,
      movableTokenIds: [],
      currentTurn: nextPlayer,
      currentTurnIndex: state.activePlayers.indexOf(nextPlayer),
      status: 'ROLLING',
      rollsWithoutSix: updatedRollsWithoutSix,
      turnCounts: updatedTurnCounts,
      lastEvent: `⚠️ 3 consecutive sixes! ${capitalize(player)} lost turn.`,
    };
  }

  const movableTokenIds = getMovableTokens(state, diceVal);

  if (movableTokenIds.length === 0) {
    // No moves possible -> turn passes to next player unless they have another roll
    const nextPlayer = getNextPlayer(state);
    return {
      ...state,
      diceValue: diceVal,
      hasRolled: true,
      consecutiveSixes: 0,
      movableTokenIds: [],
      status: 'NO_MOVES',
      rollsWithoutSix: updatedRollsWithoutSix,
      turnCounts: updatedTurnCounts,
      lastEvent: `${capitalize(player)} rolled a ${diceVal} (No legal moves)`,
    };
  }

  return {
    ...state,
    diceValue: diceVal,
    hasRolled: true,
    consecutiveSixes,
    movableTokenIds,
    status: 'WAITING_SELECT',
    rollsWithoutSix: updatedRollsWithoutSix,
    turnCounts: updatedTurnCounts,
    lastEvent: `${capitalize(player)} rolled a ${diceVal}! Select a token to move.`,
  };
}

export function passTurn(state) {
  const nextPlayer = getNextPlayer(state);
  return {
    ...state,
    diceValue: null,
    hasRolled: false,
    movableTokenIds: [],
    currentTurn: nextPlayer,
    currentTurnIndex: state.activePlayers.indexOf(nextPlayer),
    status: 'ROLLING',
    lastEvent: `${capitalize(nextPlayer)}'s turn to roll!`,
  };
}

export function getMovableTokens(state, diceVal) {
  const player = state.currentTurn;
  const playerTokens = state.tokens[player] || [];

  return playerTokens
    .filter((token) => {
      if (token.isHome) return false;
      if (token.step === -1) {
        // Can only exit base on 6
        return diceVal === 6;
      }
      // Must not overshoot HOME_STEP (56)
      return token.step + diceVal <= HOME_STEP;
    })
    .map((t) => t.id);
}

export function moveToken(state, tokenId) {
  const player = state.currentTurn;
  const playerTokens = state.tokens[player];
  const tokenIndex = playerTokens.findIndex((t) => t.id === tokenId);
  if (tokenIndex === -1) return state;

  const token = playerTokens[tokenIndex];
  const diceVal = state.diceValue;

  let newStep = token.step === -1 ? 0 : token.step + diceVal;
  let isHome = newStep === HOME_STEP;
  let hasCapture = false;
  let capturedTokenInfo = null;
  let extraRoll = diceVal === 6;
  let eventMsg = `${capitalize(player)} moved token ${token.index + 1} (${diceVal} steps)`;

  // Copy state tokens
  const newTokens = { ...state.tokens };
  const updatedPlayerTokens = [...newTokens[player]];
  let updatedToken = {
    ...token,
    step: newStep,
    isHome,
  };

  // Check Power blitz tile if gameMode === 'power'
  let bonusSteps = 0;
  if (state.gameMode === 'power' && newStep >= 0 && newStep <= 50) {
    const trackIdx = getTrackIndex(player, newStep);
    const power = getPowerAtTrackIndex(trackIdx);
    if (power) {
      const outcome = power.apply(updatedToken);
      if (outcome.bonusSteps > 0 && newStep + outcome.bonusSteps <= HOME_STEP) {
        newStep += outcome.bonusSteps;
        updatedToken.step = newStep;
        if (newStep === HOME_STEP) {
          isHome = true;
          updatedToken.isHome = true;
        }
      }
      if (outcome.shield) updatedToken.shield = true;
      if (outcome.extraRoll) extraRoll = true;
      eventMsg += ` | ${outcome.message}`;
    }
  }

  updatedPlayerTokens[tokenIndex] = updatedToken;
  newTokens[player] = updatedPlayerTokens;

  // Check for Captures on common track
  if (newStep >= 0 && newStep <= 50) {
    const currentTrackIdx = getTrackIndex(player, newStep);
    const isSafeSquare = SAFE_INDICES.includes(currentTrackIdx);

    if (!isSafeSquare) {
      // Check all opponent tokens
      state.activePlayers.forEach((opp) => {
        if (opp !== player) {
          const oppTokens = [...newTokens[opp]];
          let modified = false;

          oppTokens.forEach((oppToken, idx) => {
            if (oppToken.step >= 0 && oppToken.step <= 50) {
              const oppTrackIdx = getTrackIndex(opp, oppToken.step);
              if (oppTrackIdx === currentTrackIdx) {
                if (oppToken.shield) {
                  // Shield absorbs capture!
                  oppTokens[idx] = { ...oppToken, shield: false };
                  modified = true;
                  eventMsg += ` | 🛡️ Opponent's shield absorbed the attack!`;
                } else {
                  // Capture! Send back to base
                  oppTokens[idx] = { ...oppToken, step: -1 };
                  modified = true;
                  hasCapture = true;
                  extraRoll = true;
                  capturedTokenInfo = { player: opp, index: oppToken.index };
                  eventMsg += ` | 💥 Captured ${capitalize(opp)}! Extra roll awarded!`;
                }
              }
            }
          });

          if (modified) {
            newTokens[opp] = oppTokens;
          }
        }
      });
    }
  }

  // Token reached home
  if (isHome) {
    extraRoll = true;
    eventMsg += ` | 🏆 Token reached HOME! Extra roll awarded!`;
  }

  // Check winner
  const tokensNeededToWin = state.gameMode === 'rush' ? 2 : 4;
  const homeCount = newTokens[player].filter((t) => t.isHome).length;
  const newWinners = [...state.winners];
  let isGameOver = false;

  if (homeCount >= tokensNeededToWin && !newWinners.includes(player)) {
    newWinners.push(player);
    eventMsg += ` | 👑 ${capitalize(player)} finished in position #${newWinners.length}!`;
    if (newWinners.length >= state.activePlayers.length - 1) {
      isGameOver = true;
    }
  }

  const nextPlayer = extraRoll ? player : getNextPlayer({ ...state, winners: newWinners });

  return {
    ...state,
    tokens: newTokens,
    diceValue: null,
    hasRolled: false,
    movableTokenIds: [],
    winners: newWinners,
    status: isGameOver ? 'GAME_OVER' : 'ROLLING',
    currentTurn: nextPlayer,
    currentTurnIndex: state.activePlayers.indexOf(nextPlayer),
    lastEvent: eventMsg,
    stats: {
      ...state.stats,
      [player]: {
        captures: state.stats[player].captures + (hasCapture ? 1 : 0),
        homeCount: homeCount,
      },
    },
  };
}

export function getTrackIndex(player, step) {
  if (step < 0 || step > 50) return -1;
  const startIdx = PLAYER_CONFIG[player].startIndex;
  return (startIdx + step) % 52;
}

export function getNextPlayer(state) {
  const active = state.activePlayers.filter((p) => !state.winners.includes(p));
  if (active.length <= 1) return state.currentTurn;

  let nextIdx = (state.activePlayers.indexOf(state.currentTurn) + 1) % state.activePlayers.length;
  while (state.winners.includes(state.activePlayers[nextIdx])) {
    nextIdx = (nextIdx + 1) % state.activePlayers.length;
  }
  return state.activePlayers[nextIdx];
}

export function getTokenCoordinates(token) {
  const { player, step, index } = token;
  const config = PLAYER_CONFIG[player];

  // In Base
  if (step === -1) {
    return config.baseCoords[index];
  }

  // On common track (0..50)
  if (step >= 0 && step <= 50) {
    const trackIdx = getTrackIndex(player, step);
    return TRACK_COORDS[trackIdx];
  }

  // In colored home corridor (51..55)
  if (step >= 51 && step <= 55) {
    const homeStepIdx = step - 51;
    return config.homePath[homeStepIdx];
  }

  // Reached Center Home (56)
  return { r: 7, c: 7 };
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
