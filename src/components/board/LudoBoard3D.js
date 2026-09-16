import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  GRID_SIZE,
  TRACK_COORDS,
  SAFE_INDICES,
  PLAYER_CONFIG,
} from '../../ludo/LudoConstants.js';
import { getTokenCoordinates } from '../../ludo/LudoEngine.js';
import { getPowerAtTrackIndex } from '../../ludo/PowerTiles.js';
import { PLAYER_COLORS } from '../../theme/colors.js';
import PinToken3D from '../3d/PinToken3D.js';
import CenterHome3D from './CenterHome3D.js';

/**
 * Premium Human-Crafted Ludo Board
 * - Clean, elegant wooden-rimmed 15x15 board
 * - Circular ornate courtyards with brass bezels for the 4 player bases
 * - Clean, vibrant colored home lanes (no repetitive robotic arrows)
 * - Distinct 3D Golden Stars on safe tiles
 * - Tokens displayed cleanly with radial stacking on shared tiles
 */
export default function LudoBoard3D({
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
    if (r < 6 && c < 6) return null; // Red Base
    if (r < 6 && c > 8) return null; // Green Base
    if (r > 8 && c > 8) return null; // Yellow Base
    if (r > 8 && c < 6) return null; // Blue Base
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return null; // Center Home

    // Determine cell characteristics
    let bgColor = '#FFFDF9'; // Soft warm parchment white
    let borderColor = '#E2D9C8';
    let icon = null;
    let iconColor = '#D4AF37';
    let isHomeLane = false;

    // 1. Home Lanes (Clean, rich colored paths)
    if (r === 7 && c >= 1 && c <= 5) {
      bgColor = PLAYER_COLORS.red.primary;
      isHomeLane = true;
    } else if (c === 7 && r >= 1 && r <= 5) {
      bgColor = PLAYER_COLORS.green.primary;
      isHomeLane = true;
    } else if (r === 7 && c >= 9 && c <= 13) {
      bgColor = PLAYER_COLORS.yellow.primary;
      isHomeLane = true;
    } else if (c === 7 && r >= 9 && r <= 13) {
      bgColor = PLAYER_COLORS.blue.primary;
      isHomeLane = true;
    }

    // 2. Starting Squares (with start arrow)
    if (r === 6 && c === 1) {
      bgColor = PLAYER_COLORS.red.primary;
      icon = '★';
      iconColor = '#FFFFFF';
    } else if (r === 1 && c === 8) {
      bgColor = PLAYER_COLORS.green.primary;
      icon = '★';
      iconColor = '#FFFFFF';
    } else if (r === 8 && c === 13) {
      bgColor = PLAYER_COLORS.yellow.primary;
      icon = '★';
      iconColor = '#FFFFFF';
    } else if (r === 13 && c === 6) {
      bgColor = PLAYER_COLORS.blue.primary;
      icon = '★';
      iconColor = '#FFFFFF';
    }

    // 3. Safe Star Squares (Prominent Golden Star)
    const trackIndex = TRACK_COORDS.findIndex((coord) => coord.r === r && coord.c === c);
    if (trackIndex !== -1 && SAFE_INDICES.includes(trackIndex)) {
      icon = '★';
      iconColor = '#D97706';
      if (!isHomeLane) bgColor = '#FEF9C3'; // Subtle golden glow background for safe tiles
    }

    // 4. Power Blitz mode icons
    if (state.gameMode === 'power' && trackIndex !== -1) {
      const power = getPowerAtTrackIndex(trackIndex);
      if (power) {
        icon = power.icon;
      }
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
        {icon && (
          <Text
            style={[
              styles.cellIcon,
              {
                fontSize: cellSize * 0.46,
                color: iconColor,
              },
            ]}
          >
            {icon}
          </Text>
        )}
      </View>
    );
  };

  // Render Corner Base Box with authentic circular courtyard and 2x2 pedestals
  const renderBaseBox = (player, top, left) => {
    const pColor = PLAYER_COLORS[player];
    const boxSize = cellSize * 6;
    const circleSize = boxSize * 0.76;

    const tokensInBase = (state.tokens[player] || []).filter((t) => t.step === -1);
    const isCurrentTurn = state.currentTurn === player;

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
            backgroundColor: pColor.primary,
          },
        ]}
      >
        {/* Ornate Circular Courtyard */}
        <View
          style={[
            styles.circularCourtyard,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: '#FFFFFF',
              borderColor: isCurrentTurn ? '#FDE047' : '#E2E8F0',
            },
            isCurrentTurn && styles.activeBaseGlow,
          ]}
        >
          {/* Base Header with Player Name & Avatar */}
          <Text style={[styles.basePlayerName, { color: pColor.secondary }]}>
            {pColor.icon} {pColor.name.split(' ')[0]}
          </Text>

          {/* 4 Pin Pedestals in classic 2x2 Grid */}
          <View style={styles.pedestalsGrid2x2}>
            {[0, 1, 2, 3].map((idx) => {
              const tokenAtBase = tokensInBase.find((t) => t.index === idx);
              const isMovable = tokenAtBase && state.movableTokenIds.includes(tokenAtBase.id);

              return (
                <View
                  key={`pedestal_${player}_${idx}`}
                  style={[
                    styles.pedestalSpot,
                    {
                      width: cellSize * 1.18,
                      height: cellSize * 1.18,
                      borderRadius: (cellSize * 1.18) / 2,
                      backgroundColor: isMovable ? '#FEF08A' : '#F1F5F9',
                      borderColor: isMovable ? pColor.primary : '#CBD5E1',
                    },
                  ]}
                >
                  {tokenAtBase && (
                    <PinToken3D
                      token={tokenAtBase}
                      isMovable={isMovable}
                      onPress={onSelectToken}
                      size={cellSize * 0.88}
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

  // Render tokens on track or in home corridor
  const renderActiveTokens = () => {
    const rendered = [];

    Object.keys(tokensByCell).forEach((cellKey) => {
      const [rStr, cStr] = cellKey.split('_');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);

      // Skip base tokens (already rendered in base pedestals)
      const isBaseCell =
        (r < 6 && c < 6) ||
        (r < 6 && c > 8) ||
        (r > 8 && c > 8) ||
        (r > 8 && c < 6);
      if (isBaseCell) return;

      const tokensHere = tokensByCell[cellKey];

      tokensHere.forEach((token, offsetIdx) => {
        const isMovable = state.movableTokenIds.includes(token.id);

        rendered.push(
          <View
            key={`token_${token.id}`}
            style={[
              styles.tokenAbsolute,
              {
                top: r * cellSize - cellSize * 0.22,
                left: c * cellSize + cellSize * 0.08,
                width: cellSize,
                height: cellSize * 1.3,
                zIndex: isMovable ? 50 : 20 + r,
              },
            ]}
          >
            <PinToken3D
              token={token}
              isMovable={isMovable}
              onPress={onSelectToken}
              size={cellSize * 0.88}
              offsetIndex={offsetIdx}
              totalOnTile={tokensHere.length}
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

  return (
    <View
      style={[
        styles.boardContainer,
        {
          width: boardSize,
          height: boardSize,
        },
      ]}
    >
      {/* 1. Track Cells */}
      {gridCells}

      {/* 2. Four Corner Bases with Ornate Circular Courtyard */}
      {renderBaseBox('red', 0, 0)}
      {renderBaseBox('green', 0, cellSize * 9)}
      {renderBaseBox('yellow', cellSize * 9, cellSize * 9)}
      {renderBaseBox('blue', cellSize * 9, 0)}

      {/* 3. Central Victory Home */}
      <View
        style={[
          styles.centerContainer,
          {
            top: cellSize * 6,
            left: cellSize * 6,
            width: cellSize * 3,
            height: cellSize * 3,
          },
        ]}
      >
        <CenterHome3D size={cellSize * 3} />
      </View>

      {/* 4. Active Tokens on Board */}
      {renderActiveTokens()}
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    position: 'relative',
    backgroundColor: '#FAF8F5',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#2A1F18', // Rich mahogany wood border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellIcon: {
    fontWeight: '900',
  },
  baseBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2A1F18',
  },
  circularCourtyard: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  activeBaseGlow: {
    borderWidth: 3.5,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  basePlayerName: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pedestalsGrid2x2: {
    width: '78%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'space-around',
    gap: 6,
  },
  pedestalSpot: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  centerContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  tokenAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
