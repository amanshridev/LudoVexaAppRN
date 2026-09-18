import { Vibration } from 'react-native';

class SoundController {
  constructor() {
    this.soundEnabled = true;
    this.audioBridge = null;
    this.audioCtx = null;
  }

  setBridge(bridge) {
    this.audioBridge = bridge;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  // Synthesize Web Audio sound effects (Piece moving sound, Dice flip clatter, etc.)
  _playAudioEffect(type) {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'move' || type === 'hop') {
        // Piece moving sound: Crisp wooden pop hop (440Hz -> 880Hz pitch bend)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'dice' || type === 'diceFlip') {
        // Dice flipping sound: 5 rapid 3D tumbling clacks
        for (let i = 0; i < 5; i++) {
          const delay = i * 0.045;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const freq = 240 + Math.random() * 260;
          osc.frequency.setValueAtTime(freq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(70, now + delay + 0.035);

          gain.gain.setValueAtTime(0.28 - i * 0.03, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.04);
        }
      } else if (type === 'capture') {
        // Capture explosion sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'turn') {
        // Turn switch chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Ignore audio synth errors
    }
  }

  play(type) {
    if (!this.soundEnabled) return;

    // Haptic feedback
    try {
      if (type === 'dice' || type === 'diceFlip') Vibration.vibrate([0, 15, 20, 15, 20]);
      else if (type === 'capture') Vibration.vibrate([0, 50, 40, 60]);
      else if (type === 'victory') Vibration.vibrate([0, 80, 50, 80, 50, 100]);
      else if (type === 'hop' || type === 'move') Vibration.vibrate(12);
      else Vibration.vibrate(10);
    } catch {
      // Ignore vibration error on unsupported platforms
    }

    // Web Audio Synthesizer
    this._playAudioEffect(type);

    // Audio bridge message (GlobalSoundBridge WebView)
    if (this.audioBridge) {
      if (typeof this.audioBridge.injectJavaScript === 'function') {
        this.audioBridge.injectJavaScript(`if (window.playSound) { window.playSound('${type}'); } true;`);
      } else if (typeof this.audioBridge.postMessage === 'function') {
        this.audioBridge.postMessage(JSON.stringify({ type: 'PLAY_SOUND', sound: type }));
      }
    }
  }

  dice() {
    this.play('diceFlip');
  }

  diceFlip() {
    this.play('diceFlip');
  }

  hop() {
    this.play('move');
  }

  move() {
    this.play('move');
  }

  capture() {
    this.play('capture');
  }

  safeStar() {
    this.play('safe');
  }

  powerUp() {
    this.play('power');
  }

  victory() {
    this.play('victory');
  }

  turnSwitch() {
    this.play('turn');
  }
}

export const SoundFX = new SoundController();

