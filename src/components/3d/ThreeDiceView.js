import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ThreeDiceView({
  targetValue = 6,
  isRolling = false,
  onRollComplete,
  size = 110,
  themeColor = '#D4AF37',
  diceBg = '#1E293B',
}) {
  const webViewRef = useRef(null);

  // Send roll command to Three.js scene inside WebView
  useEffect(() => {
    if (isRolling && webViewRef.current) {
      const script = `if (window.rollDice) { window.rollDice(${targetValue}); } true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [isRolling, targetValue]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ROLL_COMPLETE' && onRollComplete) {
        onRollComplete(data.value);
      }
    } catch {
      // Ignore parse errors
    }
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #canvas3d {
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas3d"></div>
  <script>
    (function() {
      const container = document.getElementById('canvas3d');
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 4.5, 6.5);
      camera.lookAt(0, 0, 0);

      // 2. Renderer with Antialiasing and Alpha
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // 3. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      dirLight.position.set(5, 10, 7);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      const pointLight = new THREE.PointLight('${themeColor}', 1.2, 10);
      pointLight.position.set(-3, 2, 4);
      scene.add(pointLight);

      // 4. Shadow Receiver Plane
      const shadowGeo = new THREE.PlaneGeometry(8, 8);
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.1;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // 5. Procedural Textures for 6 Dice Faces with Pips
      function createFaceCanvas(val) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = '${diceBg}';
        ctx.fillRect(0, 0, 256, 256);

        // Rounded inner border
        ctx.strokeStyle = '${themeColor}';
        ctx.lineWidth = 14;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(14, 14, 228, 228, 36);
        } else {
          ctx.rect(14, 14, 228, 228);
        }
        ctx.stroke();

        // Subtle gradient highlight
        const grad = ctx.createRadialGradient(80, 80, 20, 128, 128, 140);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Draw metallic pips
        function drawPip(x, y) {
          ctx.save();
          // Pip shadow
          ctx.beginPath();
          ctx.arc(x + 2, y + 2, 20, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fill();

          // Pip body
          ctx.beginPath();
          ctx.arc(x, y, 19, 0, Math.PI * 2);
          const pGrad = ctx.createRadialGradient(x - 5, y - 5, 3, x, y, 18);
          pGrad.addColorStop(0, '#FFFFFF');
          pGrad.addColorStop(0.3, '${themeColor}');
          pGrad.addColorStop(1, '#92400E');
          ctx.fillStyle = pGrad;
          ctx.fill();

          // Bevel ring
          ctx.strokeStyle = '#FDE68A';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }

        const m = 128, l = 68, r = 188, t = 68, b = 188;
        if (val === 1) drawPip(m, m);
        if (val === 2) { drawPip(l, t); drawPip(r, b); }
        if (val === 3) { drawPip(l, t); drawPip(m, m); drawPip(r, b); }
        if (val === 4) { drawPip(l, t); drawPip(r, t); drawPip(l, b); drawPip(r, b); }
        if (val === 5) { drawPip(l, t); drawPip(r, t); drawPip(m, m); drawPip(l, b); drawPip(r, b); }
        if (val === 6) { drawPip(l, t); drawPip(r, t); drawPip(l, m); drawPip(r, m); drawPip(l, b); drawPip(r, b); }

        return c;
      }

      // 6 Materials for BoxGeometry (right:1, left:6, top:2, bottom:5, front:3, back:4)
      const materials = [
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(createFaceCanvas(1)), roughness: 0.25, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(createFaceCanvas(6)), roughness: 0.25, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(createFaceCanvas(2)), roughness: 0.25, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(createFaceCanvas(5)), roughness: 0.25, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(createFaceCanvas(3)), roughness: 0.25, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(createFaceCanvas(4)), roughness: 0.25, metalness: 0.4 })
      ];

      // 6. 3D Dice Mesh
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const dice = new THREE.Mesh(geometry, materials);
      dice.castShadow = true;
      dice.receiveShadow = true;
      scene.add(dice);

      // Target Euler angles to face camera for each value
      // camera is at roughly (0, 4.5, 6.5) looking at (0, 0, 0)
      const targetRotations = {
        1: { x: 0, y: -Math.PI / 2, z: 0 },
        6: { x: 0, y: Math.PI / 2, z: 0 },
        2: { x: Math.PI / 2, y: 0, z: 0 },
        5: { x: -Math.PI / 2, y: 0, z: 0 },
        3: { x: 0, y: 0, z: 0 },
        4: { x: 0, y: Math.PI, z: 0 }
      };

      let isRolling = false;
      let rollStartTime = 0;
      let rollDuration = 900;
      let startRot = { x: 0, y: 0, z: 0 };
      let endRot = { x: 0, y: 0, z: 0 };
      let targetVal = ${targetValue};

      // Set initial orientation
      const initR = targetRotations[targetVal] || targetRotations[6];
      dice.rotation.set(initR.x, initR.y, initR.z);

      window.rollDice = function(val) {
        targetVal = val || 6;
        isRolling = true;
        rollStartTime = performance.now();

        startRot = { x: dice.rotation.x, y: dice.rotation.y, z: dice.rotation.z };
        const dest = targetRotations[targetVal] || targetRotations[6];

        // Add 3-4 full multi-axis physics tumbles
        const extraTurnsX = (Math.floor(Math.random() * 2) + 3) * Math.PI * 2;
        const extraTurnsY = (Math.floor(Math.random() * 2) + 3) * Math.PI * 2;
        const extraTurnsZ = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;

        endRot = {
          x: dest.x + extraTurnsX,
          y: dest.y + extraTurnsY,
          z: dest.z + extraTurnsZ
        };
      };

      // Animation Loop
      function animate(time) {
        requestAnimationFrame(animate);

        if (isRolling) {
          const elapsed = time - rollStartTime;
          const progress = Math.min(elapsed / rollDuration, 1.0);

          // Ease Out Bounce / Quart
          const t = 1 - Math.pow(1 - progress, 3);

          dice.rotation.x = startRot.x + (endRot.x - startRot.x) * t;
          dice.rotation.y = startRot.y + (endRot.y - startRot.y) * t;
          dice.rotation.z = startRot.z + (endRot.z - startRot.z) * t;

          // Vertical bounce impulse during roll
          const bounce = Math.sin(progress * Math.PI) * 1.6 * (1 - progress * 0.7);
          dice.position.y = bounce;

          if (progress >= 1.0) {
            isRolling = false;
            // Snap to exact rotation
            const dest = targetRotations[targetVal] || targetRotations[6];
            dice.rotation.set(dest.x, dest.y, dest.z);
            dice.position.y = 0;

            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ROLL_COMPLETE',
                value: targetVal
              }));
            }
          }
        } else {
          // Subtle idle breathing float
          dice.position.y = Math.sin(time * 0.002) * 0.06;
        }

        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);

      // Handle window resize
      window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    })();
  </script>
</body>
</html>
`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        androidLayerType="hardware"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderRadius: 16,
  },
  webview: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
});
