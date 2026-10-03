import Sound from 'react-native-sound';

// Enable playback in silence mode
try {
  Sound.setCategory('Playback', true);
} catch (e) {
  // Silent fallback if platform does not support setCategory
}

/**
 * SOUND REQUIRE / ASSET MAP
 * All audio asset references declared in ONE place at the top of SoundManager.
 * Standard Ludo King style audio triggers.
 */
const SOUND_REQUIRE_MAP = {
  diceRoll: 'dice_roll.mp3',
  diceLand: 'dice_land.mp3',
  tokenSelect: 'token_select.mp3',
  step: 'step.mp3',
  tokenEnter: 'token_enter.mp3',
  safe: 'safe.mp3',
  kill: 'kill.mp3',
  killed: 'killed.mp3',
  killedMine: 'killed_mine.mp3',
  captureReturn: 'capture_return.mp3',
  tokenFinish: 'token_finish.mp3',
  extraTurn: 'extra_turn.mp3',
  turnChange: 'turn_change.mp3',
  invalid: 'invalid.mp3',
  winner: 'winner.mp3',
  buttonTap: 'button_tap.mp3',
};

// Balanced default volume table (0.0 to 1.0)
const DEFAULT_VOLUMES = {
  diceRoll: 0.75,
  diceLand: 0.7,
  tokenSelect: 0.5,
  step: 0.35,
  tokenEnter: 0.85,
  safe: 0.65,
  kill: 0.95,
  killed: 0.85,
  killedMine: 0.95,
  captureReturn: 0.7,
  tokenFinish: 0.9,
  extraTurn: 0.85,
  turnChange: 0.25,
  invalid: 0.4,
  winner: 1.0,
  buttonTap: 0.45,
};

const POOLED_SOUNDS = ['step', 'diceRoll'];
const POOL_SIZE = 3;

class SoundManagerClass {
  constructor() {
    this.isMuted = false;
    this.isLoaded = false;
    this.sounds = {};
    this.pools = {};
    this.poolIndices = {};
  }

  /**
   * Preload all sounds on screen mount.
   * Fails silently if any sound file is missing or invalid.
   */
  init() {
    if (this.isLoaded) return;
    this.isLoaded = true;

    try {
      Sound.setCategory('Playback', true);
    } catch (_) {}

    Object.keys(SOUND_REQUIRE_MAP).forEach((key) => {
      const file = SOUND_REQUIRE_MAP[key];
      if (!file) return;

      if (POOLED_SOUNDS.includes(key)) {
        this.pools[key] = [];
        this.poolIndices[key] = 0;
        for (let i = 0; i < POOL_SIZE; i++) {
          try {
            const s = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
              if (error) {
                // Missing file or unsupported format -> fail silently
              }
            });
            this.pools[key].push(s);
          } catch (_) {
            // Never crash
          }
        }
      } else {
        try {
          this.sounds[key] = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              // Missing file -> fail silently
              this.sounds[key] = null;
            }
          });
        } catch (_) {
          this.sounds[key] = null;
        }
      }
    });
  }

  /**
   * Set global mute state.
   * If muted, immediately stops any currently playing audio.
   */
  setMuted(muted) {
    try {
      this.isMuted = Boolean(muted);
      if (this.isMuted) {
        this.stopAll();
      }
    } catch (_) {}
  }

  getMuted() {
    return this.isMuted;
  }

  /**
   * Play sound with volume and rate options.
   * - Supports overlapping playback via 3-instance pool for 'step' and 'diceRoll'.
   * - Fallback from 'killedMine' to 'killed' if 'killedMine' file not present.
   */
  play(name, options = {}) {
    if (this.isMuted) return;

    try {
      const volume = options.volume !== undefined ? options.volume : (DEFAULT_VOLUMES[name] ?? 0.7);
      const rate = options.rate !== undefined ? options.rate : 1.0;

      // Fallback for killedMine -> killed
      let targetName = name;
      if (targetName === 'killedMine' && !this.sounds['killedMine']) {
        targetName = 'killed';
      }

      // 1. Pooled sounds (step, diceRoll)
      if (POOLED_SOUNDS.includes(targetName) && this.pools[targetName]?.length > 0) {
        const pool = this.pools[targetName];
        const idx = this.poolIndices[targetName] || 0;
        const sound = pool[idx];
        this.poolIndices[targetName] = (idx + 1) % pool.length;

        if (sound) {
          try {
            sound.stop(() => {
              try {
                sound.setVolume(volume);
                if (typeof sound.setSpeed === 'function') {
                  sound.setSpeed(rate);
                }
                sound.setCurrentTime(0);
                sound.play();
              } catch (_) {}
            });
          } catch (_) {}
        }
        return;
      }

      // 2. Single instance sounds
      const sound = this.sounds[targetName];
      if (sound) {
        try {
          sound.stop(() => {
            try {
              sound.setVolume(volume);
              if (typeof sound.setSpeed === 'function') {
                sound.setSpeed(rate);
              }
              sound.setCurrentTime(0);
              sound.play();
            } catch (_) {}
          });
        } catch (_) {}
      }
    } catch (_) {
      // Sound failure must never crash or block game logic
    }
  }

  /**
   * Stop playing sound
   */
  stop(name) {
    try {
      if (POOLED_SOUNDS.includes(name) && this.pools[name]) {
        this.pools[name].forEach((s) => {
          try {
            s?.stop();
          } catch (_) {}
        });
      } else if (this.sounds[name]) {
        this.sounds[name]?.stop();
      }
    } catch (_) {}
  }

  /**
   * Stop all active sounds
   */
  stopAll() {
    try {
      Object.keys(this.sounds).forEach((k) => this.stop(k));
      Object.keys(this.pools).forEach((k) => this.stop(k));
    } catch (_) {}
  }

  /**
   * Unload and release audio resources on unmount
   */
  unload() {
    try {
      this.stopAll();
      Object.keys(this.sounds).forEach((k) => {
        try {
          this.sounds[k]?.release();
        } catch (_) {}
        delete this.sounds[k];
      });
      Object.keys(this.pools).forEach((k) => {
        try {
          this.pools[k]?.forEach((s) => s?.release());
        } catch (_) {}
        delete this.pools[k];
      });
      this.isLoaded = false;
    } catch (_) {}
  }
}

const SoundManager = new SoundManagerClass();
export default SoundManager;
