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
  const gameMode = options.gameMode || 'power'; // 'power' | 'classic' | 'rush'
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
    stats: {
      red: { captures: 0, homeCount: 0 },
      green: { captures: 0, homeCount: 0 },
      yellow: { captures: 0, homeCount: 0 },
      blue: { captures: 0, homeCount: 0 },
    },
  };
}

export function rollDice(state, forcedValue = null) {
  if (state.hasRolled && state.movableTokenIds.length > 0) {
    return state; // Must move token first
  }

  const diceVal = forcedValue || Math.floor(Math.random() * 6) + 1;
  const player = state.currentTurn;
  let consecutiveSixes = diceVal === 6 ? state.consecutiveSixes + 1 : 0;

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
