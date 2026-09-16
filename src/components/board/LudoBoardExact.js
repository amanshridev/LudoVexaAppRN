import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Polygon,
  Path,
} from 'react-native-svg';
import {
  GRID_SIZE,
  TRACK_COORDS,
  SAFE_INDICES,
} from '../../ludo/LudoConstants.js';
import { getTokenCoordinates } from '../../ludo/LudoEngine.js';

export const THEME_PALETTES = {
  classic: {
    boardBg: '#FFFFFF',
    red: { base: '#D92525', dark: '#991B1B', path: '#D92525', token: '#D92525', goldRing: '#EAB308' },
    green: { base: '#238838', dark: '#166534', path: '#238838', token: '#238838', goldRing: '#EAB308' },
    yellow: { base: '#DDA715', dark: '#A16207', path: '#DDA715', token: '#DDA715', goldRing: '#EAB308' },
    blue: { base: '#2255A4', dark: '#1E3A8A', path: '#2255A4', token: '#2255A4', goldRing: '#EAB308' },
  },
  neon: {
    boardBg: '#090D1A',
    red: { base: '#FF007F', dark: '#99004C', path: '#FF007F', token: '#FF007F', goldRing: '#00FFCC' },
    green: { base: '#00FFCC', dark: '#00997A', path: '#00FFCC', token: '#00FFCC', goldRing: '#FFD700' },
    yellow: { base: '#FFD700', dark: '#B39700', path: '#FFD700', token: '#FFD700', goldRing: '#00FFCC' },
    blue: { base: '#0099FF', dark: '#0066CC', path: '#0099FF', token: '#0099FF', goldRing: '#FFD700' },
  },
  wood: {
    boardBg: '#EFEBE9',
    red: { base: '#C62828', dark: '#8E0000', path: '#C62828', token: '#C62828', goldRing: '#F57F17' },
    green: { base: '#2E7D32', dark: '#005005', path: '#2E7D32', token: '#2E7D32', goldRing: '#F57F17' },
    yellow: { base: '#F57F17', dark: '#BC5100', path: '#F57F17', token: '#F57F17', goldRing: '#8E0000' },
    blue: { base: '#1565C0', dark: '#003C8F', path: '#1565C0', token: '#1565C0', goldRing: '#F57F17' },
  },
  galaxy: {
    boardBg: '#020617',
    red: { base: '#EC4899', dark: '#9D174D', path: '#EC4899', token: '#EC4899', goldRing: '#6366F1' },
    green: { base: '#10B981', dark: '#047857', path: '#10B981', token: '#10B981', goldRing: '#F59E0B' },
    yellow: { base: '#F59E0B', dark: '#B45309', path: '#F59E0B', token: '#F59E0B', goldRing: '#6366F1' },
    blue: { base: '#6366F1', dark: '#4338CA', path: '#6366F1', token: '#6366F1', goldRing: '#EC4899' },
  },
  pastel: {
    boardBg: '#FAF5FF',
    red: { base: '#FCA5A5', dark: '#EF4444', path: '#FCA5A5', token: '#FCA5A5', goldRing: '#FDE047' },
    green: { base: '#86EFAC', dark: '#22C55E', path: '#86EFAC', token: '#86EFAC', goldRing: '#93C5FD' },
    yellow: { base: '#FDE047', dark: '#EAB308', path: '#FDE047', token: '#FDE047', goldRing: '#86EFAC' },
    blue: { base: '#93C5FD', dark: '#3B82F6', path: '#93C5FD', token: '#93C5FD', goldRing: '#FCA5A5' },
  },
  dark: {
    boardBg: '#050B14',
    red: { base: '#EF4444', dark: '#991B1B', path: '#EF4444', token: '#EF4444', goldRing: '#F59E0B' },
    green: { base: '#10B981', dark: '#047857', path: '#10B981', token: '#10B981', goldRing: '#F59E0B' },
    yellow: { base: '#F59E0B', dark: '#B45309', path: '#F59E0B', token: '#F59E0B', goldRing: '#3B82F6' },
    blue: { base: '#3B82F6', dark: '#1D4ED8', path: '#3B82F6', token: '#3B82F6', goldRing: '#F59E0B' },
  },
};

export const EXACT_COLORS = THEME_PALETTES.classic;

export function ExactLudoToken({ player = 'red', size = 26, isMovable = false, onPress, palette }) {
  const themeColors = palette || THEME_PALETTES.classic;
  const col = themeColors[player] || themeColors.red;

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
      <View
        style={[
          styles.tokenShadow,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />

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
          <Text style={[styles.tokenStar, { fontSize: size * 0.44 }]}>★</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LudoBoardExact({
  state,
  onSelectToken,
  boardSize = 350,
  theme = 'classic',
}) {
  const cellSize = boardSize / GRID_SIZE;
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.classic;

  const tokensByCell = {};
  state.activePlayers.forEach((player) => {
    (state.tokens[player] || []).forEach((token) => {
      const coords = getTokenCoordinates(token);
      const key = `${coords.r}_${coords.c}`;
      if (!tokensByCell[key]) tokensByCell[key] = [];
      tokensByCell[key].push(token);
    });
  });

  const renderCell = (r, c) => {
    if (r < 6 && c < 6) return null;
    if (r < 6 && c > 8) return null;
    if (r > 8 && c > 8) return null;
    if (r > 8 && c < 6) return null;
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return null;

    let bgColor = palette.boardBg || '#FFFFFF';
    let borderColor = '#64748B';
    let content = null;

    if (c === 7 && r >= 9 && r <= 13) {
      bgColor = palette.red.path;
    } else if (r === 7 && c >= 1 && c <= 5) {
      bgColor = palette.green.path;
    } else if (c === 7 && r >= 1 && r <= 5) {
      bgColor = palette.yellow.path;
    } else if (r === 7 && c >= 9 && c <= 13) {
      bgColor = palette.blue.path;
    }

    if (r === 6 && c === 1) {
      bgColor = palette.boardBg || '#FFFFFF';
      borderColor = palette.green.path;
    } else if (r === 1 && c === 8) {
      bgColor = palette.boardBg || '#FFFFFF';
      borderColor = palette.yellow.path;
    } else if (r === 8 && c === 13) {
      bgColor = palette.boardBg || '#FFFFFF';
      borderColor = palette.blue.path;
    } else if (r === 13 && c === 6) {
      bgColor = palette.boardBg || '#FFFFFF';
      borderColor = palette.red.path;
    }

    const trackIndex = TRACK_COORDS.findIndex((coord) => coord.r === r && coord.c === c);
    if (trackIndex !== -1 && SAFE_INDICES.includes(trackIndex)) {
      content = (
        <View style={styles.silverStarBadge}>
          <Text style={styles.silverStarText}>★</Text>
        </View>
      );
    }

    if (r === 14 && c === 5) {
      content = (
        <Text style={[styles.curvedArrow, { color: palette.red.path, transform: [{ rotate: '90deg' }] }]}>
          ↶
        </Text>
      );
    } else if (r === 5 && c === 0) {
      content = (
        <Text style={[styles.curvedArrow, { color: palette.green.path, transform: [{ rotate: '0deg' }] }]}>
          ↶
        </Text>
      );
    } else if (r === 0 && c === 9) {
      content = (
        <Text style={[styles.curvedArrow, { color: palette.yellow.path, transform: [{ rotate: '270deg' }] }]}>
          ↶
        </Text>
      );
    } else if (r === 9 && c === 14) {
      content = (
        <Text style={[styles.curvedArrow, { color: palette.blue.path, transform: [{ rotate: '180deg' }] }]}>
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

  const renderBaseBox = (player, top, left, label, labelPosition) => {
    const col = palette[player] || palette.red;
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

        <View
          style={[
            styles.whiteCourtyard,
            {
              width: whiteCircleSize,
              height: whiteCircleSize,
              borderRadius: whiteCircleSize / 2,
              backgroundColor: palette.boardBg || '#FFFFFF',
            },
          ]}
        >
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
                      palette={palette}
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

  const renderActiveTokens = () => {
    const rendered = [];

    Object.keys(tokensByCell).forEach((cellKey) => {
      const [rStr, cStr] = cellKey.split('_');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);

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
              palette={palette}
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
          backgroundColor: palette.boardBg || '#FFFFFF',
        },
      ]}
    >
      {gridCells}

      {renderBaseBox('green', 0, 0)}
      {renderBaseBox('yellow', 0, cellSize * 9, 'Player2', 'top-right')}
      {renderBaseBox('blue', cellSize * 9, cellSize * 9)}
      {renderBaseBox('red', cellSize * 9, 0, 'Player1', 'bottom-left')}

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
          <Polygon points="0,0 100,0 50,50" fill={palette.yellow.path} />
          <Polygon points="100,0 100,100 50,50" fill={palette.blue.path} />
          <Polygon points="0,100 100,100 50,50" fill={palette.red.path} />
          <Polygon points="0,0 0,100 50,50" fill={palette.green.path} />
          <Path d="M0 0 L100 100 M100 0 L0 100" stroke="#FFFFFF" strokeWidth="1.5" />
        </Svg>

        <Text style={[styles.centerArrow, { top: -2, left: -2, transform: [{ rotate: '225deg' }] }]}>➔</Text>
        <Text style={[styles.centerArrow, { top: -2, right: -2, transform: [{ rotate: '315deg' }] }]}>➔</Text>
        <Text style={[styles.centerArrow, { bottom: -2, left: -2, transform: [{ rotate: '135deg' }] }]}>➔</Text>
        <Text style={[styles.centerArrow, { bottom: -2, right: -2, transform: [{ rotate: '45deg' }] }]}>➔</Text>
      </View>

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
