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

  window.playSound = function(type) {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;

      if (type === 'move' || type === 'hop') {
        // Piece moving sound: Crisp wooden pop hop (440Hz -> 880Hz pitch bend)
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'dice' || type === 'diceFlip') {
        // Dice flipping sound: 5 rapid tumbling clacks
        for (var i = 0; i < 5; i++) {
          (function(idx) {
            var delay = idx * 0.045;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            var freq = 220 + Math.random() * 260;
            osc.frequency.setValueAtTime(freq, now + delay);
            osc.frequency.exponentialRampToValueAtTime(70, now + delay + 0.035);

            gain.gain.setValueAtTime(0.35 - idx * 0.04, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.04);
          })(i);
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
        // Fanfare chord: C5, E5, G5, C6
        var notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach(function(freq, idx) {
          var delay = idx * 0.1;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.3, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.3);
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
