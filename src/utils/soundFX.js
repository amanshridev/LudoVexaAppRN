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
        // Chess piece tap: Solid wood-on-wood thud with brief resonance
        // Low-frequency knock
        const knock = ctx.createOscillator();
        const knockGain = ctx.createGain();
        knock.type = 'sine';
        knock.frequency.setValueAtTime(180, now);
        knock.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        knockGain.gain.setValueAtTime(0.45, now);
        knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        knock.connect(knockGain);
        knockGain.connect(ctx.destination);
        knock.start(now);
        knock.stop(now + 0.08);

        // Wood body resonance
        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        body.type = 'triangle';
        body.frequency.setValueAtTime(320, now);
        body.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        bodyGain.gain.setValueAtTime(0.18, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        body.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        body.start(now);
        body.stop(now + 0.07);

        // High-frequency surface click
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(2400, now);
        click.frequency.exponentialRampToValueAtTime(800, now + 0.015);
        clickGain.gain.setValueAtTime(0.08, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(now);
        click.stop(now + 0.02);
      } else if (type === 'dice' || type === 'diceFlip') {
        // Classic board game dice: Shaking in cup then rolling out
        // Phase 1: Rapid rattling in cup (8 fast noise bursts)
        for (let i = 0; i < 8; i++) {
          const delay = i * 0.035;
          const rattle = ctx.createOscillator();
          const rattleGain = ctx.createGain();
          rattle.type = 'square';
          const freq = 600 + Math.random() * 800;
          rattle.frequency.setValueAtTime(freq, now + delay);
          rattle.frequency.exponentialRampToValueAtTime(200 + Math.random() * 200, now + delay + 0.02);
          const vol = 0.12 + Math.random() * 0.06;
          rattleGain.gain.setValueAtTime(vol, now + delay);
          rattleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.025);
          rattle.connect(rattleGain);
          rattleGain.connect(ctx.destination);
          rattle.start(now + delay);
          rattle.stop(now + delay + 0.025);
        }

        // Phase 2: Dice landing thuds (2-3 heavier impacts)
        const landStart = 0.32;
        for (let j = 0; j < 3; j++) {
          const lDelay = landStart + j * 0.08;
          const thud = ctx.createOscillator();
          const thudGain = ctx.createGain();
          thud.type = 'sine';
          thud.frequency.setValueAtTime(160 - j * 30, now + lDelay);
          thud.frequency.exponentialRampToValueAtTime(50, now + lDelay + 0.06);
          const thudVol = 0.3 - j * 0.08;
          thudGain.gain.setValueAtTime(thudVol, now + lDelay);
          thudGain.gain.exponentialRampToValueAtTime(0.001, now + lDelay + 0.07);
          thud.connect(thudGain);
          thudGain.connect(ctx.destination);
          thud.start(now + lDelay);
          thud.stop(now + lDelay + 0.07);

          // Surface click on each landing
          const tap = ctx.createOscillator();
          const tapGain = ctx.createGain();
          tap.type = 'triangle';
          tap.frequency.setValueAtTime(1200 - j * 200, now + lDelay);
          tap.frequency.exponentialRampToValueAtTime(300, now + lDelay + 0.02);
          tapGain.gain.setValueAtTime(0.15 - j * 0.04, now + lDelay);
          tapGain.gain.exponentialRampToValueAtTime(0.001, now + lDelay + 0.03);
          tap.connect(tapGain);
          tapGain.connect(ctx.destination);
          tap.start(now + lDelay);
          tap.stop(now + lDelay + 0.03);
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
      } else if (type === 'victory') {
        // Royal Triumphant Victory Fanfare
        const arpeggio = [
          { f: 523.25, t: 0 },
          { f: 659.25, t: 0.09 },
          { f: 783.99, t: 0.18 },
          { f: 1046.50, t: 0.27 },
          { f: 1318.51, t: 0.36 },
          { f: 1567.98, t: 0.45 }
        ];
        arpeggio.forEach(item => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(item.f, now + item.t);
          gain.gain.setValueAtTime(0.35, now + item.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + item.t);
          osc.stop(now + item.t + 0.22);
        });

        const chordStart = 0.55;
        const chordNotes = [523.25, 783.99, 1046.50, 1318.51];
        chordNotes.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + chordStart);
          gain.gain.setValueAtTime(0.18, now + chordStart);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordStart + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + chordStart);
          osc.stop(now + chordStart + 1.2);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq / 2, now + chordStart);
          gain2.gain.setValueAtTime(0.25, now + chordStart);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + chordStart + 1.2);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + chordStart);
          osc2.stop(now + chordStart + 1.2);
        });
      }
    } catch {
      // Ignore audio synth errors
    }
  }

  play(type) {
    if (!this.soundEnabled) return;

    // Haptic feedback (only on major events like roll, capture, victory — not every cell hop)
    try {
      if (type === 'dice' || type === 'diceFlip') Vibration.vibrate([0, 15, 20, 15, 20]);
      else if (type === 'capture') Vibration.vibrate([0, 50, 40, 60]);
      else if (type === 'victory') Vibration.vibrate([0, 80, 50, 80, 50, 100]);
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

