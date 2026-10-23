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
import { LUDO_THEMES_LIST } from '../../theme/colors.js';

import CenterHome3D from './CenterHome3D.js';
import PinToken3D from '../3d/PinToken3D.js';

export const THEME_PALETTES = {
  ocean: {
    boardBg: '#E0F2FE',
    red: { base: '#E11D48', dark: '#9F1239', path: '#E11D48', token: '#E11D48', goldRing: '#38BDF8' },
    green: { base: '#0D9488', dark: '#115E59', path: '#0D9488', token: '#0D9488', goldRing: '#38BDF8' },
    yellow: { base: '#EAB308', dark: '#A16207', path: '#EAB308', token: '#EAB308', goldRing: '#0284C7' },
    blue: { base: '#0284C7', dark: '#0369A1', path: '#0284C7', token: '#0284C7', goldRing: '#FACC15' },
  },
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
  gold: {
    boardBg: '#1A140E',
    red: { base: '#D4AF37', dark: '#92400E', path: '#D4AF37', token: '#D4AF37', goldRing: '#F59E0B' },
    green: { base: '#10B981', dark: '#047857', path: '#10B981', token: '#10B981', goldRing: '#D4AF37' },
    yellow: { base: '#F59E0B', dark: '#B45309', path: '#F59E0B', token: '#F59E0B', goldRing: '#D4AF37' },
    blue: { base: '#3B82F6', dark: '#1D4ED8', path: '#3B82F6', token: '#3B82F6', goldRing: '#D4AF37' },
  },
  sakura: {
    boardBg: '#FFF1F2',
    red: { base: '#F472B6', dark: '#BE185D', path: '#F472B6', token: '#F472B6', goldRing: '#34D399' },
    green: { base: '#34D399', dark: '#059669', path: '#34D399', token: '#34D399', goldRing: '#F472B6' },
    yellow: { base: '#FDE047', dark: '#CA8A04', path: '#FDE047', token: '#FDE047', goldRing: '#60A5FA' },
    blue: { base: '#60A5FA', dark: '#2563EB', path: '#60A5FA', token: '#60A5FA', goldRing: '#F472B6' },
  },
  amethyst: {
    boardBg: '#130B24',
    red: { base: '#C084FC', dark: '#7E22CE', path: '#C084FC', token: '#C084FC', goldRing: '#06B6D4' },
    green: { base: '#06B6D4', dark: '#0E7490', path: '#06B6D4', token: '#06B6D4', goldRing: '#FBBF24' },
    yellow: { base: '#FBBF24', dark: '#B45309', path: '#FBBF24', token: '#FBBF24', goldRing: '#C084FC' },
    blue: { base: '#818CF8', dark: '#4338CA', path: '#818CF8', token: '#818CF8', goldRing: '#C084FC' },
  },
  dragon: {
    boardBg: '#180A0A',
    red: { base: '#EF4444', dark: '#991B1B', path: '#EF4444', token: '#EF4444', goldRing: '#FBBF24' },
    green: { base: '#22C55E', dark: '#15803D', path: '#22C55E', token: '#22C55E', goldRing: '#EF4444' },
    yellow: { base: '#FBBF24', dark: '#B45309', path: '#FBBF24', token: '#FBBF24', goldRing: '#EF4444' },
    blue: { base: '#3B82F6', dark: '#1D4ED8', path: '#3B82F6', token: '#3B82F6', goldRing: '#FBBF24' },
  },
  storm: {
    boardBg: '#070F1E',
    red: { base: '#EC4899', dark: '#9D174D', path: '#EC4899', token: '#EC4899', goldRing: '#FDE047' },
    green: { base: '#14B8A6', dark: '#0F766E', path: '#14B8A6', token: '#14B8A6', goldRing: '#2563EB' },
    yellow: { base: '#FDE047', dark: '#CA8A04', path: '#FDE047', token: '#FDE047', goldRing: '#EC4899' },
    blue: { base: '#2563EB', dark: '#1E40AF', path: '#2563EB', token: '#2563EB', goldRing: '#FDE047' },
  },
  jungle: {
    boardBg: '#F0FDF4',
    red: { base: '#DC2626', dark: '#991B1B', path: '#DC2626', token: '#DC2626', goldRing: '#EAB308' },
    green: { base: '#16A34A', dark: '#166534', path: '#16A34A', token: '#16A34A', goldRing: '#EAB308' },
    yellow: { base: '#EAB308', dark: '#A16207', path: '#EAB308', token: '#EAB308', goldRing: '#16A34A' },
    blue: { base: '#0284C7', dark: '#075985', path: '#0284C7', token: '#0284C7', goldRing: '#EAB308' },
  },
  vintage: {
    boardBg: '#FEFCE8',
    red: { base: '#B91C1C', dark: '#7F1D1D', path: '#B91C1C', token: '#B91C1C', goldRing: '#CA8A04' },
    green: { base: '#15803D', dark: '#14532D', path: '#15803D', token: '#15803D', goldRing: '#CA8A04' },
    yellow: { base: '#CA8A04', dark: '#854D0E', path: '#CA8A04', token: '#CA8A04', goldRing: '#B91C1C' },
    blue: { base: '#1E40AF', dark: '#1E3A8A', path: '#1E40AF', token: '#1E40AF', goldRing: '#CA8A04' },
  },
  stealth: {
    boardBg: '#0B0F19',
    red: { base: '#F43F5E', dark: '#9F1239', path: '#F43F5E', token: '#F43F5E', goldRing: '#38BDF8' },
    green: { base: '#10B981', dark: '#047857', path: '#10B981', token: '#10B981', goldRing: '#F59E0B' },
    yellow: { base: '#F59E0B', dark: '#B45309', path: '#F59E0B', token: '#F59E0B', goldRing: '#F43F5E' },
    blue: { base: '#38BDF8', dark: '#0284C7', path: '#38BDF8', token: '#38BDF8', goldRing: '#F59E0B' },
  },
  rainbow: {
    boardBg: '#F8FAFC',
    red: { base: '#EF4444', dark: '#B91C1C', path: '#EF4444', token: '#EF4444', goldRing: '#F59E0B' },
    green: { base: '#10B981', dark: '#047857', path: '#10B981', token: '#10B981', goldRing: '#3B82F6' },
    yellow: { base: '#F59E0B', dark: '#B45309', path: '#F59E0B', token: '#F59E0B', goldRing: '#10B981' },
    blue: { base: '#3B82F6', dark: '#1D4ED8', path: '#3B82F6', token: '#3B82F6', goldRing: '#EF4444' },
  },
  arctic: {
    boardBg: '#F0F9FF',
    red: { base: '#FB7185', dark: '#E11D48', path: '#FB7185', token: '#FB7185', goldRing: '#0284C7' },
    green: { base: '#06B6D4', dark: '#0891B2', path: '#06B6D4', token: '#06B6D4', goldRing: '#FBBF24' },
    yellow: { base: '#FBBF24', dark: '#D97706', path: '#FBBF24', token: '#FBBF24', goldRing: '#0284C7' },
    blue: { base: '#0284C7', dark: '#0369A1', path: '#0284C7', token: '#0284C7', goldRing: '#FB7185' },
  },
  ruby: {
    boardBg: '#17060D',
    red: { base: '#E11D48', dark: '#881337', path: '#E11D48', token: '#E11D48', goldRing: '#FBBF24' },
    green: { base: '#10B981', dark: '#047857', path: '#10B981', token: '#10B981', goldRing: '#E11D48' },
    yellow: { base: '#FBBF24', dark: '#B45309', path: '#FBBF24', token: '#FBBF24', goldRing: '#E11D48' },
    blue: { base: '#4F46E5', dark: '#312E81', path: '#4F46E5', token: '#4F46E5', goldRing: '#FBBF24' },
  },
  nebula: {
    boardBg: '#090514',
    red: { base: '#E879F9', dark: '#A21CAF', path: '#E879F9', token: '#E879F9', goldRing: '#FACC15' },
    green: { base: '#2DD4BF', dark: '#0F766E', path: '#2DD4BF', token: '#2DD4BF', goldRing: '#6366F1' },
    yellow: { base: '#FACC15', dark: '#A16207', path: '#FACC15', token: '#FACC15', goldRing: '#E879F9' },
    blue: { base: '#6366F1', dark: '#4338CA', path: '#6366F1', token: '#6366F1', goldRing: '#2DD4BF' },
  },
};

export function getThemePalette(themeId) {
  if (THEME_PALETTES[themeId]) return THEME_PALETTES[themeId];
  const found = (LUDO_THEMES_LIST || []).find((t) => t.id === themeId);
  if (found && found.colors && found.colors.length >= 4) {
    const [cGreen, cYellow, cBlue, cRed] = found.colors;
    return {
      boardBg: found.boardBg || '#FFFFFF',
      green: { base: cGreen, dark: cGreen, path: cGreen, token: cGreen, goldRing: '#F59E0B' },
      yellow: { base: cYellow, dark: cYellow, path: cYellow, token: cYellow, goldRing: '#3B82F6' },
      blue: { base: cBlue, dark: cBlue, path: cBlue, token: cBlue, goldRing: '#F59E0B' },
      red: { base: cRed, dark: cRed, path: cRed, token: cRed, goldRing: '#10B981' },
    };
  }
  return THEME_PALETTES.ocean || THEME_PALETTES.classic;
}

export const EXACT_COLORS = THEME_PALETTES.ocean || THEME_PALETTES.classic;

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

const SAFE_CELL_KEYS = new Set(['6_1', '2_6', '1_8', '6_12', '8_13', '12_8', '13_6', '8_2']);

const HomeBaseBox = React.memo(function HomeBaseBox({
  player,
  top,
  left,
  label,
  palette,
  cellSize,
  tokensInBase = [],
  movableTokenIds = [],
  isActive = false,
  onSelectToken,
  tokensDisabled = false,
}) {
  const col = palette[player] || palette.red;
  const boxSize = cellSize * 6;
  const whiteBoxSize = boxSize * 0.78;
  const isBottomPlayer = player === 'red' || player === 'blue';

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
      {label}
    </Text>
  );

  const hasMovableInBase = tokensInBase.some((t) => movableTokenIds.includes(t.id));

  return (
    <Animated.View
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
            const isMovable = tokenAtBase && movableTokenIds.includes(tokenAtBase.id);
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
});

function LudoBoardExact({
  state,
  onSelectToken,
  boardSize = 350,
  theme = 'classic',
  isAnimating = false,
}) {
  const BOARD_BORDER = 4;
  const cellSize = boardSize > 0 ? (boardSize - BOARD_BORDER * 2) / 15 : 0;
  const palette = getThemePalette(theme);
  const tokensDisabled = isAnimating || state.status !== 'WAITING_SELECT';

  const tokensByCell = React.useMemo(() => {
    const map = {};
    (state.activePlayers || []).forEach((player) => {
      (state.tokens[player] || []).forEach((token) => {
        const coords = getTokenCoordinates(token);
        const key = `${coords.r}_${coords.c}`;
        if (!map[key]) map[key] = [];
        map[key].push(token);
      });
    });
    return map;
  }, [state.activePlayers, state.tokens]);

  const getBaseLabel = React.useCallback((player) => {
    if (!state.activePlayers.includes(player)) return '';
    if (player === state.userColor && state.isVsAi) return 'You';
    if (state.isVsAi) {
      if (state.activePlayers.length === 2) return 'Computer';
      const playerNum = state.activePlayers.indexOf(player) + 1;
      return `Computer ${playerNum}`;
    }
    const playerNum = state.activePlayers.indexOf(player) + 1;
    return `Player ${playerNum}`;
  }, [state.activePlayers, state.userColor, state.isVsAi]);

  // Memoize static grid cells so 72 views are not recreated on every state change
  const gridCells = React.useMemo(() => {
    if (cellSize <= 0) return [];
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (r < 6 && c < 6) continue;
        if (r < 6 && c > 8) continue;
        if (r > 8 && c > 8) continue;
        if (r > 8 && c < 6) continue;
        if (r >= 6 && r <= 8 && c >= 6 && c <= 8) continue;

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

        const cellKey = `${r}_${c}`;
        if (SAFE_CELL_KEYS.has(cellKey)) {
          content = (
            <View style={styles.starBadgeContainer}>
              <Text style={styles.starOutlineIcon}>☆</Text>
            </View>
          );
        }

        if (r === 14 && c === 7) {
          content = (
            <Text style={[styles.entryArrowText, { color: palette.red.path, bottom: 1 }]}>
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

        cells.push(
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
      }
    }
    return cells;
  }, [cellSize, palette]);

  const renderActiveTokens = () => {
    if (cellSize <= 0) return null;
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
      const movableTokenInCell = tokensHere.find((t) =>
        state.movableTokenIds.includes(t.id)
      );

      // If cell contains a movable token, make the entire cell box clickable
      // so clicking anywhere in the box moves the user's token even when sharing cells!
      if (movableTokenInCell && !tokensDisabled) {
        rendered.push(
          <TouchableOpacity
            key={`box_click_${cellKey}`}
            activeOpacity={0.7}
            onPress={() => onSelectToken(movableTokenInCell.id)}
            style={[
              styles.cellBoxClickTarget,
              {
                top: BOARD_BORDER + r * cellSize,
                left: BOARD_BORDER + c * cellSize,
                width: cellSize,
                height: cellSize,
              },
            ]}
          />
        );
      }

      tokensHere.forEach((token, offsetIdx) => {
        const isMovable = state.movableTokenIds.includes(token.id);
        const count = tokensHere.length;

        let offsetX = 0;
        let offsetY = 0;
        let tokenScale = 1;

        if (count === 2) {
          // Two tokens sharing cell (e.g. safe star): clean staggered placement centered in cell
          tokenScale = 0.84;
          offsetX = (offsetIdx === 0 ? -1 : 1) * (cellSize * 0.13);
          offsetY = (offsetIdx === 0 ? 1 : -1) * (cellSize * 0.05);
        } else if (count > 2) {
          // Three or four tokens sharing cell: clustered evenly around cell center
          tokenScale = 0.72;
          const angle = (offsetIdx * 2 * Math.PI) / count - Math.PI / 4;
          offsetX = Math.cos(angle) * (cellSize * 0.16);
          offsetY = Math.sin(angle) * (cellSize * 0.12);
        }

        const tokenSize = cellSize * 0.86 * tokenScale;
        const tokenHeight = tokenSize * 1.3;

        rendered.push(
          <View
            key={`track_token_${token.id}`}
            style={[
              styles.trackTokenWrap,
              {
                top: BOARD_BORDER + r * cellSize + 0.5 * (cellSize - tokenHeight) + offsetY,
                left: BOARD_BORDER + c * cellSize + 0.5 * (cellSize - tokenSize) + offsetX,
                width: tokenSize,
                height: tokenHeight,
                zIndex: isMovable ? 50 : 20 + r + (offsetIdx || 0),
              },
            ]}
          >
            <PinToken3D
              token={token}
              size={tokenSize}
              isMovable={isMovable}
              onPress={() => onSelectToken(token.id)}
              onAlternatePress={
                movableTokenInCell
                  ? () => onSelectToken(movableTokenInCell.id)
                  : undefined
              }
              disabled={tokensDisabled}
            />
          </View>
        );
      });
    });

    return rendered;
  };

  const centerSize = cellSize * 3;

  const greenTokensInBase = React.useMemo(
    () => (state.tokens.green || []).filter((t) => t.step === -1),
    [state.tokens.green]
  );
  const yellowTokensInBase = React.useMemo(
    () => (state.tokens.yellow || []).filter((t) => t.step === -1),
    [state.tokens.yellow]
  );
  const blueTokensInBase = React.useMemo(
    () => (state.tokens.blue || []).filter((t) => t.step === -1),
    [state.tokens.blue]
  );
  const redTokensInBase = React.useMemo(
    () => (state.tokens.red || []).filter((t) => t.step === -1),
    [state.tokens.red]
  );

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

        <HomeBaseBox
          player="green"
          top={0}
          left={0}
          label={getBaseLabel('green')}
          palette={palette}
          cellSize={cellSize}
          tokensInBase={greenTokensInBase}
          movableTokenIds={state.movableTokenIds}
          isActive={state.currentTurn === 'green'}
          onSelectToken={onSelectToken}
          tokensDisabled={tokensDisabled}
        />
        <HomeBaseBox
          player="yellow"
          top={0}
          left={cellSize * 9}
          label={getBaseLabel('yellow')}
          palette={palette}
          cellSize={cellSize}
          tokensInBase={yellowTokensInBase}
          movableTokenIds={state.movableTokenIds}
          isActive={state.currentTurn === 'yellow'}
          onSelectToken={onSelectToken}
          tokensDisabled={tokensDisabled}
        />
        <HomeBaseBox
          player="blue"
          top={cellSize * 9}
          left={cellSize * 9}
          label={getBaseLabel('blue')}
          palette={palette}
          cellSize={cellSize}
          tokensInBase={blueTokensInBase}
          movableTokenIds={state.movableTokenIds}
          isActive={state.currentTurn === 'blue'}
          onSelectToken={onSelectToken}
          tokensDisabled={tokensDisabled}
        />
        <HomeBaseBox
          player="red"
          top={cellSize * 9}
          left={0}
          label={getBaseLabel('red')}
          palette={palette}
          cellSize={cellSize}
          tokensInBase={redTokensInBase}
          movableTokenIds={state.movableTokenIds}
          isActive={state.currentTurn === 'red'}
          onSelectToken={onSelectToken}
          tokensDisabled={tokensDisabled}
        />

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

export default React.memo(LudoBoardExact);


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
  cellBoxClickTarget: {
    position: 'absolute',
    zIndex: 48,
  },
});
