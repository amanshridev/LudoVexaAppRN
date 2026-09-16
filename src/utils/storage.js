import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@VexaLudo_PlayerStats_v1';
const SETTINGS_KEY = '@VexaLudo_Settings_v1';

const DEFAULT_STATS = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  captures: 0,
  homeRuns: 0,
  winStreak: 0,
  bestStreak: 0,
  trophies: 100,
  powerUpsUsed: 0,
};

const DEFAULT_SETTINGS = {
  theme: 'rajwada',
  sound: true,
  music: true,
  playerCount: 4,
  gameMode: 'power', // 'power' | 'classic' | 'rush'
  aiDifficulty: 'medium', // 'easy' | 'medium' | 'hard'
  autoRoll: false,
};

export async function loadPlayerStats() {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    if (data) {
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to load player stats', e);
  }
  return DEFAULT_STATS;
}

export async function savePlayerStats(stats) {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save player stats', e);
  }
}

export async function recordGameResult({ won, captures = 0, homeRuns = 0, powerUps = 0 }) {
  const current = await loadPlayerStats();
  const newWins = won ? current.wins + 1 : current.wins;
  const newLosses = won ? current.losses : current.losses + 1;
  const newStreak = won ? current.winStreak + 1 : 0;
  const bestStreak = Math.max(current.bestStreak, newStreak);
  const trophyDelta = won ? 25 : -10;
  const trophies = Math.max(0, current.trophies + trophyDelta);

  const updated = {
    gamesPlayed: current.gamesPlayed + 1,
    wins: newWins,
    losses: newLosses,
    captures: current.captures + captures,
    homeRuns: current.homeRuns + homeRuns,
    winStreak: newStreak,
    bestStreak,
    trophies,
    powerUpsUsed: current.powerUpsUsed + powerUps,
  };

  await savePlayerStats(updated);
  return updated;
}

export async function loadSettings() {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings', e);
  }
}
