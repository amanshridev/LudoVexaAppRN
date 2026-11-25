import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@VexaLudo_PlayerStats_v1';
const SETTINGS_KEY = '@VexaLudo_Settings_v1';
const USER_PROFILE_KEY = '@VexaLudo_UserProfile_v1';
const SPIN_WHEEL_KEY = '@VexaLudo_SpinWheel_v1';

export const DEFAULT_USER = {
  name: 'Player 1',
  id: '123456',
  coins: 1000,
  avatar: '🦁',
  stats: { played: 0, won: 0, winRate: 0 },
};

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

export const DEFAULT_SETTINGS = {
  // Appearance
  ludoTheme: 'classic',
  appColor: 'ocean',
  
  // Audio & Haptics
  sound: true,
  soundVolume: 0.8,
  music: true,
  musicVolume: 0.6,
  diceRollSound: true,
  victorySound: true,
  haptics: true,
  hapticIntensity: 'medium', // 'off' | 'soft' | 'medium' | 'strong'
  
  // Game & Rules
  playerCount: 4,
  gameMode: 'power', // 'power' | 'classic' | 'rush'
  aiDifficulty: 'medium', // 'easy' | 'medium' | 'hard'
  autoRoll: false,
  turboMode: false,
  showSafeSpots: true,
  showMovementHints: true,

  // App & Localization
  language: 'en',
  
  // Notifications
  notifications: true,
  dailyBonusAlert: true,
  friendAlert: true,
  tournamentAlert: true,
  turnAlert: true,
  quietHours: false,

  // Privacy & Account
  profileVisibility: 'public', // 'public' | 'friends' | 'private'
  showOnlineStatus: true,
  showStatsOnLeaderboard: true,
  allowDirectInvites: true,
  analytics: true,
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
      const parsed = JSON.parse(data);
      if (parsed.ludoTheme === 'ocean') {
        parsed.ludoTheme = 'classic';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
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

// User Profile Local Storage
export async function loadUserProfile() {
  try {
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (data) {
      return { ...DEFAULT_USER, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to load user profile', e);
  }
  return DEFAULT_USER;
}

export async function saveUserProfile(profile) {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save user profile', e);
  }
}

// Spin Wheel Local State (Tracking last spin date & free spin eligibility)
export async function loadSpinData() {
  try {
    const data = await AsyncStorage.getItem(SPIN_WHEEL_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load spin data', e);
  }
  return { lastFreeSpinDate: null, totalSpins: 0 };
}

export async function saveSpinData(spinData) {
  try {
    await AsyncStorage.setItem(SPIN_WHEEL_KEY, JSON.stringify(spinData));
  } catch (e) {
    console.warn('Failed to save spin data', e);
  }
}
