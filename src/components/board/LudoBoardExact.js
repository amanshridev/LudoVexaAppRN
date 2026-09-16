import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Polygon,
  Circle,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {
  GRID_SIZE,
  TRACK_COORDS,
  SAFE_INDICES,
  PLAYER_CONFIG,
} from '../../ludo/LudoConstants.js';
import { getTokenCoordinates } from '../../ludo/LudoEngine.js';

// Exact colors from reference screenshot
export const EXACT_COLORS = {
  red: {
    base: '#D92525',
    dark: '#991B1B',
    path: '#D92525',
    token: '#D92525',
    goldRing: '#EAB308',
  },
  green: {
    base: '#238838',
    dark: '#166534',
    path: '#238838',
    token: '#238838',
    goldRing: '#EAB308',
  },
  yellow: {
    base: '#DDA715',
    dark: '#A16207',
    path: '#DDA715',
    token: '#DDA715',
    goldRing: '#EAB308',
  },
  blue: {
    base: '#2255A4',
    dark: '#1E3A8A',
    path: '#2255A4',
    token: '#2255A4',
    goldRing: '#EAB308',
  },
};

/**
 * Exact Ludo Token:
 * Gold/Yellow metallic outer ring + player color inner disc + white star in center
 */
export function ExactLudoToken({ player = 'red', size = 26, isMovable = false, onPress }) {
  const col = EXACT_COLORS[player] || EXACT_COLORS.red;

  return (
    <TouchableOpacity
      activeOpacity={isMovable ? 0.7 : 1}
      onPress={onPress}
      disabled={!isMovable}
      style={[
        styles.tokenContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        isMovable && styles.movablePulse,
      ]}
    >
      {/* 3D Drop Shadow */}
      <View
        style={[
          styles.tokenShadow,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />

      {/* Gold Outer Ring */}
      <View
        style={[
          styles.tokenGoldRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: col.goldRing,
          },
        ]}
      >
        {/* Inner Colored Core */}
        <View
          style={[
            styles.tokenInnerCore,
            {
              width: size * 0.76,
              height: size * 0.76,
              borderRadius: (size * 0.76) / 2,
              backgroundColor: col.token,
            },
          ]}
        >
          {/* White Star */}
          <Text style={[styles.tokenStar, { fontSize: size * 0.44 }]}>★</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Exact Ludo Board matching reference screenshot
 */
export default function LudoBoardExact({
  state,
  onSelectToken,
  boardSize = 350,
}) {
  const cellSize = boardSize / GRID_SIZE;

  // Group tokens by cell coordinate string "r_c"
  const tokensByCell = {};
  state.activePlayers.forEach((player) => {
    (state.tokens[player] || []).forEach((token) => {
      const coords = getTokenCoordinates(token);
      const key = `${coords.r}_${coords.c}`;
      if (!tokensByCell[key]) tokensByCell[key] = [];
      tokensByCell[key].push(token);
    });
  });

  // Render individual track cell
  const renderCell = (r, c) => {
    // Skip bases and center
    if (r < 6 && c < 6) return null; // Top-Left Green
    if (r < 6 && c > 8) return null; // Top-Right Yellow
    if (r > 8 && c > 8) return null; // Bottom-Right Blue
    if (r > 8 && c < 6) return null; // Bottom-Left Red
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return null; // Center Home

    let bgColor = '#FFFFFF';
    let borderColor = '#64748B';
    let content = null;

    // 1. Home Columns
    // Red home column (bottom arm center: rows 9..13, col 7)
    if (c === 7 && r >= 9 && r <= 13) {
      bgColor = EXACT_COLORS.red.path;
    }
    // Green home column (left arm center: row 7, cols 1..5)
    else if (r === 7 && c >= 1 && c <= 5) {
      bgColor = EXACT_COLORS.green.path;
    }
    // Yellow home column (top arm center: rows 1..5, col 7)
    else if (c === 7 && r >= 1 && r <= 5) {
      bgColor = EXACT_COLORS.yellow.path;
    }
    // Blue home column (right arm center: row 7, cols 9..13)
    else if (r === 7 && c >= 9 && c <= 13) {
      bgColor = EXACT_COLORS.blue.path;
    }

    // 2. Start Squares
    // Green Start: [6, 1]
    if (r === 6 && c === 1) {
      bgColor = '#FFFFFF';
      borderColor = EXACT_COLORS.green.path;
    }
    // Yellow Start: [1, 8]
    else if (r === 1 && c === 8) {
      bgColor = '#FFFFFF';
      borderColor = EXACT_COLORS.yellow.path;
    }
    // Blue Start: [8, 13]
    else if (r === 8 && c === 13) {
      bgColor = '#FFFFFF';
      borderColor = EXACT_COLORS.blue.path;
    }
    // Red Start: [13, 6]
    else if (r === 13 && c === 6) {
      bgColor = '#FFFFFF';
      borderColor = EXACT_COLORS.red.path;
    }

    // 3. Safe Star Squares (Grey/Silver Octagon Star Shield as in screenshot)
    const trackIndex = TRACK_COORDS.findIndex((coord) => coord.r === r && coord.c === c);
    if (trackIndex !== -1 && SAFE_INDICES.includes(trackIndex)) {
      content = (
        <View style={styles.silverStarBadge}>
          <Text style={styles.silverStarText}>★</Text>
        </View>
      );
    }

    // 4. Curved U-turn arrows at track entrance into home columns (matches screenshot)
    // Red entrance curve at [14, 5] -> [14, 6]
    if (r === 14 && c === 5) {
      content = (
        <Text style={[styles.curvedArrow, { color: EXACT_COLORS.red.path, transform: [{ rotate: '90deg' }] }]}>
          ↶
        </Text>
      );
    }
    // Green entrance curve at [5, 0] -> [6, 0]
    else if (r === 5 && c === 0) {
      content = (
        <Text style={[styles.curvedArrow, { color: EXACT_COLORS.green.path, transform: [{ rotate: '0deg' }] }]}>
          ↶
        </Text>
      );
    }
    // Yellow entrance curve at [0, 9] -> [0, 8]
    else if (r === 0 && c === 9) {
      content = (
        <Text style={[styles.curvedArrow, { color: EXACT_COLORS.yellow.path, transform: [{ rotate: '270deg' }] }]}>
          ↶
        </Text>
      );
    }
    // Blue entrance curve at [9, 14] -> [8, 14]
    else if (r === 9 && c === 14) {
      content = (
        <Text style={[styles.curvedArrow, { color: EXACT_COLORS.blue.path, transform: [{ rotate: '180deg' }] }]}>
          ↶
        </Text>
      );
    }

    return (
      <View
        key={`cell_${r}_${c}`}
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            top: r * cellSize,
            left: c * cellSize,
            backgroundColor: bgColor,
            borderColor,
          },
        ]}
      >
        {content}
      </View>
    );
  };

  // Render Corner Base Box exactly as in screenshot:
  // Solid colored base with huge white circle courtyard and 4 colored circle slots!
  const renderBaseBox = (player, top, left, label, labelPosition) => {
    const col = EXACT_COLORS[player];
    const boxSize = cellSize * 6;
    const whiteCircleSize = boxSize * 0.82;

    const tokensInBase = (state.tokens[player] || []).filter((t) => t.step === -1);

    return (
      <View
        key={`base_${player}`}
        style={[
          styles.baseBox,
          {
            top,
            left,
            width: boxSize,
            height: boxSize,
            backgroundColor: col.base,
          },
        ]}
      >
        {/* Player Name Label in Corner */}
        {label && (
          <Text
            style={[
              styles.baseLabel,
              labelPosition === 'bottom-left' && styles.labelBottomLeft,
              labelPosition === 'top-right' && styles.labelTopRight,
            ]}
          >
            {label}
          </Text>
        )}

        {/* Huge White Circular Courtyard */}
        <View
          style={[
            styles.whiteCourtyard,
            {
              width: whiteCircleSize,
              height: whiteCircleSize,
              borderRadius: whiteCircleSize / 2,
            },
          ]}
        >
          {/* 4 Colored Circle Slots in 2x2 Grid */}
          <View style={styles.pedestals2x2}>
            {[0, 1, 2, 3].map((idx) => {
              const tokenAtBase = tokensInBase.find((t) => t.index === idx);
              const isMovable = tokenAtBase && state.movableTokenIds.includes(tokenAtBase.id);

              return (
                <View
                  key={`slot_${player}_${idx}`}
                  style={[
                    styles.baseSlotCircle,
                    {
                      width: cellSize * 1.25,
                      height: cellSize * 1.25,
                      borderRadius: (cellSize * 1.25) / 2,
                      backgroundColor: col.base,
                    },
                  ]}
                >
                  {tokenAtBase && (
                    <ExactLudoToken
                      player={player}
                      size={cellSize * 1.05}
                      isMovable={isMovable}
                      onPress={() => onSelectToken(tokenAtBase.id)}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // Render tokens currently on the track or in home corridors
  const renderActiveTokens = () => {
    const rendered = [];

    Object.keys(tokensByCell).forEach((cellKey) => {
      const [rStr, cStr] = cellKey.split('_');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);

      // Skip base cells (already rendered in base courtyards)
      const isBaseCell =
        (r < 6 && c < 6) ||
        (r < 6 && c > 8) ||
        (r > 8 && c > 8) ||
        (r > 8 && c < 6);
      if (isBaseCell) return;

      const tokensHere = tokensByCell[cellKey];

      tokensHere.forEach((token, offsetIdx) => {
        const isMovable = state.movableTokenIds.includes(token.id);

        let offsetX = 0;
        let offsetY = 0;
        if (tokensHere.length > 1) {
          const angle = (offsetIdx * 2 * Math.PI) / tokensHere.length;
          offsetX = Math.cos(angle) * (cellSize * 0.22);
          offsetY = Math.sin(angle) * (cellSize * 0.22);
        }

        rendered.push(
          <View
            key={`track_token_${token.id}`}
            style={[
              styles.trackTokenWrap,
              {
                top: r * cellSize + (cellSize - cellSize * 1.05) / 2 + offsetY,
                left: c * cellSize + (cellSize - cellSize * 1.05) / 2 + offsetX,
                zIndex: isMovable ? 50 : 20 + r,
              },
            ]}
          >
            <ExactLudoToken
              player={token.player}
              size={cellSize * 1.05}
              isMovable={isMovable}
              onPress={() => onSelectToken(token.id)}
            />
          </View>
        );
      });
    });

    return rendered;
  };

  // Generate grid cells
  const gridCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = renderCell(r, c);
      if (cell) gridCells.push(cell);
    }
  }

  const centerSize = cellSize * 3;

  return (
    <View
      style={[
        styles.boardWrapper,
        {
          width: boardSize,
          height: boardSize,
        },
      ]}
    >
      {/* 1. Track Cells */}
      {gridCells}

      {/* 2. Four Corner Bases matching screenshot */}
      {/* Top-Left: Green */}
      {renderBaseBox('green', 0, 0)}
      {/* Top-Right: Yellow (with upside down Player2 label) */}
      {renderBaseBox('yellow', 0, cellSize * 9, 'Player2', 'top-right')}
      {/* Bottom-Right: Blue */}
      {renderBaseBox('blue', cellSize * 9, cellSize * 9)}
      {/* Bottom-Left: Red (with Player1 label) */}
      {renderBaseBox('red', cellSize * 9, 0, 'Player1', 'bottom-left')}

      {/* 3. Center Victory Triangles (exact matching screenshot) */}
      <View
        style={[
          styles.centerArea,
          {
            top: cellSize * 6,
            left: cellSize * 6,
            width: centerSize,
            height: centerSize,
          },
        ]}
      >
        <Svg width={centerSize} height={centerSize} viewBox="0 0 100 100">
          {/* Top: Yellow Triangle */}
          <Polygon points="0,0 100,0 50,50" fill={EXACT_COLORS.yellow.path} />
          {/* Right: Blue Triangle */}
          <Polygon points="100,0 100,100 50,50" fill={EXACT_COLORS.blue.path} />
          {/* Bottom: Red Triangle */}
          <Polygon points="0,100 100,100 50,50" fill={EXACT_COLORS.red.path} />
          {/* Left: Green Triangle */}
          <Polygon points="0,0 0,100 50,50" fill={EXACT_COLORS.green.path} />

          {/* Center Dividing Lines */}
          <Path d="M0 0 L100 100 M100 0 L0 100" stroke="#FFFFFF" strokeWidth="1.5" />
        </Svg>

        {/* 4 Diagonal Feathered Arrows pointing out from center corners */}
        <Text style={[styles.centerArrow, { top: -2, left: -2, transform: [{ rotate: '225deg' }] }]}>➔</Text>
        <Text style={[styles.centerArrow, { top: -2, right: -2, transform: [{ rotate: '315deg' }] }]}>➔</Text>
        <Text style={[styles.centerArrow, { bottom: -2, left: -2, transform: [{ rotate: '135deg' }] }]}>➔</Text>
        <Text style={[styles.centerArrow, { bottom: -2, right: -2, transform: [{ rotate: '45deg' }] }]}>➔</Text>
      </View>

      {/* 4. Active Tokens on Board */}
      {renderActiveTokens()}
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrapper: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    alignSelf: 'center',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseLabel: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    zIndex: 10,
  },
  labelBottomLeft: {
    bottom: 4,
    left: 8,
  },
  labelTopRight: {
    top: 4,
    right: 8,
    transform: [{ rotate: '180deg' }],
  },
  whiteCourtyard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pedestals2x2: {
    width: '74%',
    height: '74%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  baseSlotCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  centerArea: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  centerArrow: {
    position: 'absolute',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  silverStarBadge: {
    width: '80%',
    height: '80%',
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silverStarText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '900',
  },
  curvedArrow: {
    fontSize: 16,
    fontWeight: '900',
  },
  tokenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tokenShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    bottom: -2,
  },
  tokenGoldRing: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5FF',
  },
  tokenInnerCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenStar: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 14,
  },
  movablePulse: {
    transform: [{ scale: 1.08 }],
    shadowColor: '#F59E0B',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 8,
  },
  trackTokenWrap: {
    position: 'absolute',
  },
});
