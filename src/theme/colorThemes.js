/**
 * Centralized 15 Predefined Color Themes System
 * Semantic Color Tokens:
 * - primary, primaryLight, primaryDark
 * - background, surface, surfaceCard
 * - text, secondaryText, border
 * - success, warning, error
 */

export const THEME_LIST = [
  { id: 'blue', name: 'Blue', primary: '#3B82F6', primaryLight: '#60A5FA', primaryDark: '#1D4ED8' },
  { id: 'purple', name: 'Purple', primary: '#8B5CF6', primaryLight: '#A78BFA', primaryDark: '#6D28D9' },
  { id: 'violet', name: 'Violet', primary: '#7C3AED', primaryLight: '#9F7AEA', primaryDark: '#5B21B6' },
  { id: 'pink', name: 'Pink', primary: '#EC4899', primaryLight: '#F472B6', primaryDark: '#BE185D' },
  { id: 'red', name: 'Red', primary: '#EF4444', primaryLight: '#F87171', primaryDark: '#B91C1C' },
  { id: 'orange', name: 'Orange', primary: '#F97316', primaryLight: '#FB923C', primaryDark: '#C2410C' },
  { id: 'amber', name: 'Amber', primary: '#F59E0B', primaryLight: '#FBBF24', primaryDark: '#B45309' },
  { id: 'yellow', name: 'Yellow', primary: '#EAB308', primaryLight: '#FACC15', primaryDark: '#A16207' },
  { id: 'green', name: 'Green', primary: '#22C55E', primaryLight: '#4ADE80', primaryDark: '#15803D' },
  { id: 'emerald', name: 'Emerald', primary: '#10B981', primaryLight: '#34D399', primaryDark: '#047857' },
  { id: 'teal', name: 'Teal', primary: '#14B8A6', primaryLight: '#2DD4BF', primaryDark: '#0F766E' },
  { id: 'cyan', name: 'Cyan', primary: '#06B6D4', primaryLight: '#38BDF8', primaryDark: '#0E7490' },
  { id: 'indigo', name: 'Indigo', primary: '#6366F1', primaryLight: '#818CF8', primaryDark: '#4338CA' },
  { id: 'rose', name: 'Rose', primary: '#F43F5E', primaryLight: '#FB7185', primaryDark: '#BE123C' },
  { id: 'slate', name: 'Slate', primary: '#64748B', primaryLight: '#94A3B8', primaryDark: '#334155' },
];

export function buildSemanticTheme(themeId = 'emerald') {
  const found = THEME_LIST.find((t) => t.id === themeId) || THEME_LIST.find((t) => t.id === 'emerald');

  return {
    id: found.id,
    name: found.name,
    colors: {
      primary: found.primary,
      primaryLight: found.primaryLight,
      primaryDark: found.primaryDark,
      background: '#071126',
      surface: '#0F1E36',
      surfaceCard: '#16294A',
      text: '#FFFFFF',
      secondaryText: '#94A3B8',
      mutedText: '#64748B',
      border: `${found.primary}40`,
      borderActive: found.primary,
      success: '#10B981',
      warning: '#FACC15',
      error: '#EF4444',
    },
  };
}
