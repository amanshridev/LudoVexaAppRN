import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
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

import CenterHome3D from './CenterHome3D.js';
import PinToken3D from '../3d/PinToken3D.js';

export const THEME_PALETTES = {
  classic: {
    boardBg: '#F5E6C8',
    red: { base: '#C8372D', dark: '#8B1A1A', path: '#C8372D', token: '#C8372D', goldRing: '#C8A96E' },
    green: { base: '#2D8B47', dark: '#1A6B30', path: '#2D8B47', token: '#2D8B47', goldRing: '#C8A96E' },
    yellow: { base: '#D4A017', dark: '#A07D12', path: '#D4A017', token: '#D4A017', goldRing: '#C8A96E' },
    blue: { base: '#2B5EA7', dark: '#1B3D6F', path: '#2B5EA7', token: '#2B5EA7', goldRing: '#C8A96E' },
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

export const ExactLudoToken = React.memo(function ExactLudoToken({ player = 'red', size = 26, isMovable = false, onPress, palette, token, disabled = false }) {
  if (token) {
    return (
      <PinToken3D
        token={token}
        size={size}
        isMovable={isMovable}
        onPress={onPress}
        disabled={disabled}
      />
    );
  }

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
});

export default function LudoBoardExact({
  state,
  onSelectToken,
  boardSize = 350,
  theme = 'classic',
  isAnimating = false,
}) {
  const BOARD_BORDER = 4;
  const cellSize = boardSize > 0 ? (boardSize - BOARD_BORDER * 2) / 15 : 0;
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.classic;
  const tokensDisabled = isAnimating || state.status !== 'WAITING_SELECT';

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
        <View style={styles.starBadgeContainer}>
          <Text style={styles.starOutlineIcon}>☆</Text>
        </View>
      );
    }

    if (r === 14 && c === 7) {
      content = (
        <Text style={[styles.entryArrowText, { color: palette.red.path,bottom: 1 }]}>
          ↑
        </Text>
      );
    } else if (r === 7 && c === 0) {
      content = (
        <Text style={[styles.entryArrowText, { color: palette.green.path }]}>
          →
        </Text>
      );
    } else if (r === 0 && c === 7) {
      content = (
        <Text style={[styles.entryArrowText, { color: palette.yellow.path }]}>
          ↓
        </Text>
      );
    } else if (r === 7 && c === 14) {
      content = (
        <Text style={[styles.entryArrowText, { color: palette.blue.path }]}>
          ←
        </Text>
      );
    }

    const cellKey = `${r}_${c}`;
    const tokensOnCell = tokensByCell[cellKey] || [];
    const movableTokenOnCell = tokensOnCell.find((t) => state.movableTokenIds.includes(t.id));

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
            borderColor: borderColor,
            borderWidth: 0.6,
            zIndex: 1,
          },
        ]}
      >
        {content}
      </View>
    );
  };

  const getBaseLabel = (player) => {
    const isHuman = state.playerTypes?.[player] === 'human';
    if (player === state.userColor && state.isVsAi) return 'You';
    const playerNum = state.activePlayers.indexOf(player) + 1;
    if (state.isVsAi) {
      return `Computer ${playerNum}`;
    }
    return `Player ${playerNum}`;
  };

  const HomeBaseBox = ({ player, top, left, label }) => {
    const col = palette[player] || palette.red;
    const boxSize = cellSize * 6;
    const whiteBoxSize = boxSize * 0.78;
    const isBottomPlayer = player === 'red' || player === 'blue';
    const isActive = player === state.currentTurn;

    const opacityAnim = React.useRef(new Animated.Value(isActive ? 1 : 0.5)).current;
    const pulseAnim = React.useRef(new Animated.Value(0.35)).current;

    React.useEffect(() => {
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.5,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, [isActive, opacityAnim]);

    React.useEffect(() => {
      let anim;
      if (isActive) {
        anim = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 900,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.35,
              duration: 900,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
        anim.start();
      } else {
        pulseAnim.setValue(0);
      }
      return () => anim?.stop();
    }, [isActive, pulseAnim]);

    const baseLabel = (
      <Text
        style={[
          styles.baseLabelText,
          isBottomPlayer && styles.baseLabelBelow,
        ]}
      >
        {label || getBaseLabel(player)}
      </Text>
    );

    const tokensInBase = (state.tokens[player] || []).filter((t) => t.step === -1);
    const hasMovableInBase = tokensInBase.some((t) => state.movableTokenIds.includes(t.id));

    return (
      <Animated.View
        key={`base_${player}`}
        style={[
          styles.baseBox,
          {
            top,
            left,
            width: boxSize,
            height: boxSize,
            backgroundColor: col.base,
            borderWidth: hasMovableInBase ? 2.5 : 0,
            borderColor: hasMovableInBase ? '#FACC15' : 'transparent',
            zIndex: hasMovableInBase ? 40 : 10,
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Active glowing border with slow pulse */}
        {isActive && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeBaseGlowBorder,
              {
                borderColor: col.goldRing || '#FACC15',
                opacity: pulseAnim,
              },
            ]}
          />
        )}

        {!isBottomPlayer && baseLabel}

        <View
          style={[
            styles.whiteCourtyardSquare,
            {
              width: whiteBoxSize,
              height: whiteBoxSize,
              backgroundColor: palette.boardBg || '#FFFFFF',
            },
          ]}
        >
          <View style={styles.pedestals2x2}>
            {[0, 1, 2, 3].map((idx) => {
              const tokenAtBase = tokensInBase.find((t) => t.index === idx);
              const isMovable = tokenAtBase && state.movableTokenIds.includes(tokenAtBase.id);
              const slotSize = cellSize * 1.35;
              const tokenSize = cellSize * 0.98;

              return (
                <View
                  key={`slot_${player}_${idx}`}
                  style={[
                    styles.baseSlotCircle,
                    {
                      width: slotSize,
                      height: slotSize,
                      borderRadius: slotSize / 2,
                      borderColor: isMovable ? '#FACC15' : col.base,
                    },
                    isMovable && styles.baseSlotMovableGlow,
                  ]}
                >
                  {/* Inner recessed cup circle */}
                  <View
                    style={[
                      styles.baseSlotInnerPad,
                      {
                        width: slotSize * 0.78,
                        height: slotSize * 0.78,
                        borderRadius: (slotSize * 0.78) / 2,
                        backgroundColor: col.base,
                      },
                    ]}
                  />

                  {tokenAtBase && (
                    <View style={styles.slotTokenCenter}>
                      <PinToken3D
                        token={tokenAtBase}
                        size={tokenSize}
                        isMovable={isMovable}
                        onPress={() => onSelectToken(tokenAtBase.id)}
                        disabled={tokensDisabled}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        {isBottomPlayer && baseLabel}
      </Animated.View>
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
          offsetX = Math.cos(angle) * (cellSize * 0.16);
          offsetY = Math.sin(angle) * (cellSize * 0.16);
        }

        const tokenSize = cellSize * 0.72;
        const tokenHeight = tokenSize * 1.3;

        rendered.push(
          <View
            key={`track_token_${token.id}`}
            style={[
              styles.trackTokenWrap,
              {
                top: BOARD_BORDER + r * cellSize + 0.52 * cellSize - 0.8308 * tokenHeight + offsetY,
                left: BOARD_BORDER + c * cellSize + 0.5 * (cellSize - tokenSize) + offsetX,
                width: tokenSize,
                height: tokenHeight,
                zIndex: isMovable ? 50 : 20 + r,
              },
            ]}
          >
            <PinToken3D
              token={token}
              size={tokenSize}
              isMovable={isMovable}
              onPress={() => onSelectToken(token.id)}
              disabled={tokensDisabled}
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
        },
      ]}
    >
      {/* Inner Board Background Surface */}
      <View
        style={[
          styles.innerBoardSurface,
          {
            width: boardSize,
            height: boardSize,
            backgroundColor: palette.boardBg || '#FFFFFF',
          },
        ]}
      >
        {gridCells}

        <HomeBaseBox player="green" top={0} left={0} />
        <HomeBaseBox player="yellow" top={0} left={cellSize * 9} />
        <HomeBaseBox player="blue" top={cellSize * 9} left={cellSize * 9} />
        <HomeBaseBox player="red" top={cellSize * 9} left={0} />

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
          <CenterHome3D size={centerSize} theme={theme} />
        </View>
      </View>

      {/* Active Pawns rendered with overflow visible so 3D heads are never cut off at top */}
      {renderActiveTokens()}
    </View>
  );
}


const styles = StyleSheet.create({
  boardWrapper: {
    position: 'relative',
    overflow: 'visible',
    alignSelf: 'center',
    zIndex: 20,
  },
  innerBoardSurface: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#C8A96E',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.6,
    borderColor: '#D4C4A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBaseGlowBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 3,
    borderRadius: 8,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 45,
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
  baseLabelText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  baseLabelBelow: {
    marginTop: 2,
    marginBottom: 0,
  },
  whiteCourtyardSquare: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pedestals2x2: {
    width: '84%',
    height: '84%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  baseSlotCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  baseSlotMovableGlow: {
    borderColor: '#FACC15',
    borderWidth: 3,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  baseSlotInnerPad: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  slotTokenCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  starBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starOutlineIcon: {
    fontSize: 18,
    color: '#334155',
    fontWeight: '900',
  },
  entryArrowText: {
    fontSize: 18,
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
