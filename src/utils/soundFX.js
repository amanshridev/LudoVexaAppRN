import { Vibration } from 'react-native';

class SoundController {
  constructor() {
    this.soundEnabled = true;
    this.audioBridge = null;
  }

  setBridge(bridge) {
    this.audioBridge = bridge;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  play(type) {
    if (!this.soundEnabled) return;

    // Haptic feedback
    try {
      if (type === 'dice') Vibration.vibrate([0, 20, 30, 20]);
      else if (type === 'capture') Vibration.vibrate([0, 50, 40, 60]);
      else if (type === 'victory') Vibration.vibrate([0, 80, 50, 80, 50, 100]);
      else if (type === 'hop') Vibration.vibrate(12);
      else Vibration.vibrate(10);
    } catch {
      // Ignore vibration error on unsupported platforms
    }

    // Synthesized Web Audio effect via bridge
    if (this.audioBridge && typeof this.audioBridge.postMessage === 'function') {
      this.audioBridge.postMessage(JSON.stringify({ type: 'PLAY_SOUND', sound: type }));
    }
  }

  dice() {
    this.play('dice');
  }

  hop() {
    this.play('hop');
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
