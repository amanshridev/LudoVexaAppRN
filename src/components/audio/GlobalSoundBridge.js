import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SoundFX } from '../../utils/soundFX.js';

/**
 * Global Web Audio Synthesizer Bridge for React Native
 * Runs in a 1x1 background WebView to generate real audio sound effects
 * (piece moving, dice flipping, captures, victory fanfare) across Android & iOS.
 */
export default function GlobalSoundBridge() {
  const webViewRef = useRef(null);

  useEffect(() => {
    if (webViewRef.current) {
      SoundFX.setBridge(webViewRef.current);
    }
  }, []);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
<script>
  var audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Pre-initialize on interaction
  document.addEventListener('touchstart', getAudioContext, { once: true });
  document.addEventListener('click', getAudioContext, { once: true });

  window.playSound = function(type, opts) {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      if (type === 'move' || type === 'hop' || type === 'step') {
        // Classic Ludo King wooden pawn step tap:
        // Punchy wood knock + tone body + crisp surface snap with pitch scaling per step
        var step = (opts && typeof opts.step === 'number') ? opts.step : 0;
        var pitch = Math.min(1.5, 1.0 + step * 0.08);

        // Low-frequency knock
        var knock = ctx.createOscillator();
        var knockGain = ctx.createGain();
        knock.type = 'sine';
        knock.frequency.setValueAtTime(220 * pitch, now);
        knock.frequency.exponentialRampToValueAtTime(75 * pitch, now + 0.07);
        knockGain.gain.setValueAtTime(0.75, now);
        knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        knock.connect(knockGain);
        knockGain.connect(ctx.destination);
        knock.start(now);
        knock.stop(now + 0.08);

        // Wood body resonance
        var body = ctx.createOscillator();
        var bodyGain = ctx.createGain();
        body.type = 'triangle';
        body.frequency.setValueAtTime(420 * pitch, now);
        body.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.06);
        bodyGain.gain.setValueAtTime(0.35, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        body.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        body.start(now);
        body.stop(now + 0.07);

        // High-frequency surface click / snap
        var click = ctx.createOscillator();
        var clickGain = ctx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(2800 * pitch, now);
        click.frequency.exponentialRampToValueAtTime(900 * pitch, now + 0.018);
        clickGain.gain.setValueAtTime(0.2, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(now);
        click.stop(now + 0.02);
      } else if (type === 'tokenSelect') {
        // Bubble pop when token is tapped to select
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1050, now + 0.09);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'tokenEnter') {
        // Upbeat launch jingle when token exits base (C5 -> E5 -> G5)
        var notes = [523.25, 659.25, 783.99];
        notes.forEach(function(freq, idx) {
          var tOffset = idx * 0.07;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + tOffset);
          gain.gain.setValueAtTime(0.4, now + tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + tOffset);
          osc.stop(now + tOffset + 0.1);
        });
      } else if (type === 'safe') {
        // Magical sparkle chime on star safe cell
        var stars = [1318.51, 1567.98, 2093.00];
        stars.forEach(function(freq, idx) {
          var tOffset = idx * 0.05;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + tOffset);
          gain.gain.setValueAtTime(0.3, now + tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + tOffset);
          osc.stop(now + tOffset + 0.22);
        });
      } else if (type === 'extraTurn') {
        // Cheerful double chime
        [659.25, 880.00].forEach(function(freq, idx) {
          var tOffset = idx * 0.11;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + tOffset);
          gain.gain.setValueAtTime(0.35, now + tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + tOffset);
          osc.stop(now + tOffset + 0.16);
        });
      } else if (type === 'buttonTap') {
        // Short clean UI click
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'invalid') {
        // Low double thud
        [160, 130].forEach(function(freq, idx) {
          var tOffset = idx * 0.08;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + tOffset);
          gain.gain.setValueAtTime(0.35, now + tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + tOffset);
          osc.stop(now + tOffset + 0.06);
        });
      } else if (type === 'dice' || type === 'diceFlip') {
        // Classic board game dice: Shaking in cup then rolling out
        // Phase 1: Rapid rattling in cup (8 fast noise bursts)
        for (var i = 0; i < 8; i++) {
          (function(idx) {
            var delay = idx * 0.035;
            var rattle = ctx.createOscillator();
            var rattleGain = ctx.createGain();
            rattle.type = 'square';
            var freq = 600 + Math.random() * 800;
            rattle.frequency.setValueAtTime(freq, now + delay);
            rattle.frequency.exponentialRampToValueAtTime(200 + Math.random() * 200, now + delay + 0.02);
            var vol = 0.15 + Math.random() * 0.08;
            rattleGain.gain.setValueAtTime(vol, now + delay);
            rattleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.025);
            rattle.connect(rattleGain);
            rattleGain.connect(ctx.destination);
            rattle.start(now + delay);
            rattle.stop(now + delay + 0.025);
          })(i);
        }

        // Phase 2: Dice landing thuds (2-3 heavier impacts)
        var landStart = 0.32;
        for (var j = 0; j < 3; j++) {
          (function(jj) {
            var lDelay = landStart + jj * 0.08;
            var thud = ctx.createOscillator();
            var thudGain = ctx.createGain();
            thud.type = 'sine';
            thud.frequency.setValueAtTime(160 - jj * 30, now + lDelay);
            thud.frequency.exponentialRampToValueAtTime(50, now + lDelay + 0.06);
            var thudVol = 0.35 - jj * 0.1;
            thudGain.gain.setValueAtTime(thudVol, now + lDelay);
            thudGain.gain.exponentialRampToValueAtTime(0.001, now + lDelay + 0.07);
            thud.connect(thudGain);
            thudGain.connect(ctx.destination);
            thud.start(now + lDelay);
            thud.stop(now + lDelay + 0.07);

            // Surface click on each landing
            var tap = ctx.createOscillator();
            var tapGain = ctx.createGain();
            tap.type = 'triangle';
            tap.frequency.setValueAtTime(1200 - jj * 200, now + lDelay);
            tap.frequency.exponentialRampToValueAtTime(300, now + lDelay + 0.02);
            tapGain.gain.setValueAtTime(0.18 - jj * 0.05, now + lDelay);
            tapGain.gain.exponentialRampToValueAtTime(0.001, now + lDelay + 0.03);
            tap.connect(tapGain);
            tapGain.connect(ctx.destination);
            tap.start(now + lDelay);
            tap.stop(now + lDelay + 0.03);
          })(j);
        }
      } else if (type === 'capture') {
        // Capture explosion impact
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'victory') {
        // Royal Triumphant Victory Fanfare
        // Phase 1: Rapid ascending melody (C5, E5, G5, C6, E6, G6)
        var arpeggio = [
          { f: 523.25, t: 0 },
          { f: 659.25, t: 0.09 },
          { f: 783.99, t: 0.18 },
          { f: 1046.50, t: 0.27 },
          { f: 1318.51, t: 0.36 },
          { f: 1567.98, t: 0.45 }
        ];
        arpeggio.forEach(function(item) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(item.f, now + item.t);
          gain.gain.setValueAtTime(0.35, now + item.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + item.t);
          osc.stop(now + item.t + 0.22);
        });

        // Phase 2: Grand Sustained Triumph Chord (C5, G5, C6, E6) at 0.55s
        var chordStart = 0.55;
        var chordNotes = [523.25, 783.99, 1046.50, 1318.51];
        chordNotes.forEach(function(freq) {
          // Brass oscillator (sawtooth)
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + chordStart);
          gain.gain.setValueAtTime(0.18, now + chordStart);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordStart + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + chordStart);
          osc.stop(now + chordStart + 1.2);

          // Warm body oscillator (sine)
          var osc2 = ctx.createOscillator();
          var gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq / 2, now + chordStart);
          gain2.gain.setValueAtTime(0.25, now + chordStart);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + chordStart + 1.2);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + chordStart);
          osc2.stop(now + chordStart + 1.2);
        });
      } else if (type === 'turn') {
        // Turn switch chime
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch(e) {}
  };
</script>
</body>
</html>
  `;

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebView
        ref={(ref) => {
          webViewRef.current = ref;
          if (ref) SoundFX.setBridge(ref);
        }}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        androidLayerType="hardware"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0.01,
    overflow: 'hidden',
    bottom: -100,
    right: -100,
    zIndex: -999,
  },
  webview: {
    width: 1,
    height: 1,
    backgroundColor: 'transparent',
  },
});
