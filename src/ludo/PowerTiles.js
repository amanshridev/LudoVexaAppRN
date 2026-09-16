export const POWER_TILES = {
  4: {
    type: 'BOOST',
    name: 'Turbo Boost',
    icon: '🚀',
    description: '+3 bonus steps!',
    color: '#38BDF8',
    apply: (token) => ({
      bonusSteps: 3,
      shield: false,
      extraRoll: false,
      freezeNext: false,
      message: '🚀 Turbo Boost! +3 steps',
    }),
  },
  17: {
    type: 'SHIELD',
    name: 'Aegis Shield',
    icon: '🛡️',
    description: 'Immune to 1 capture!',
    color: '#10B981',
    apply: (token) => ({
      bonusSteps: 0,
      shield: true,
      extraRoll: false,
      freezeNext: false,
      message: '🛡️ Shield activated!',
    }),
  },
  30: {
    type: 'WARP',
    name: 'Warp Portal',
    icon: '🌀',
    description: 'Warp +5 tiles ahead!',
    color: '#A855F7',
    apply: (token) => ({
      bonusSteps: 5,
      shield: false,
      extraRoll: false,
      freezeNext: false,
      message: '🌀 Quantum Warp! +5 steps',
    }),
  },
  43: {
    type: 'LUCKY',
    name: 'Lucky Dice',
    icon: '🎲',
    description: 'Instant extra roll!',
    color: '#F59E0B',
    apply: (token) => ({
      bonusSteps: 0,
      shield: false,
      extraRoll: true,
      freezeNext: false,
      message: '🎲 Lucky Roll! Extra turn',
    }),
  },
};

export function getPowerAtTrackIndex(trackIndex) {
  return POWER_TILES[trackIndex] || null;
}
