# Troubleshooting Guide

Common issues and solutions for Emotive Engine.

## Quick Diagnostics

```javascript
// Check if mascot is initialized
console.log('Initialized:', mascot._initialized);

// Check current state (3D)
console.log('Emotion:', mascot._currentEmotion);
console.log('Geometry:', mascot._currentGeometry);

// Check if destroyed
console.log('Destroyed:', mascot._destroyed);
```

---

## Display Issues

### Mascot Not Showing

**Symptoms:** Container is empty, no errors in console.

**Solutions:**

1. **Container has no size**
   ```css
   /* Container MUST have explicit dimensions */
   #mascot-container {
       width: 300px;
       height: 300px;
   }
   ```

2. **init() not called**
   ```javascript
   const mascot = new EmotiveMascot3D({ /* config */ });
   mascot.init(container);  // Don't forget this!
   mascot.start();
   ```

3. **start() not called**
   ```javascript
   mascot.init(container);
   mascot.start();  // Animation won't run without this
   ```

4. **Container not in DOM yet**
   ```javascript
   // Wait for DOM
   document.addEventListener('DOMContentLoaded', () => {
       const container = document.getElementById('mascot');
       mascot.init(container);
   });
   ```

### Mascot Shows as Black/Empty

**Symptoms:** Canvas exists but nothing renders.

**Solutions:**

1. **WebGL context lost**
   ```javascript
   // Check WebGL support
   const canvas = document.createElement('canvas');
   const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
   if (!gl) {
       console.error('WebGL not supported');
       // Fall back to 2D mode
   }
   ```

2. **Too many WebGL contexts**
   - Browsers limit WebGL contexts (usually 8-16)
   - Call `destroy()` on unused mascots
   - Consider using 2D mode for multiple instances

3. **GPU driver issues**
   - Update graphics drivers
   - Try disabling hardware acceleration in browser

### Mascot Appears Distorted

**Symptoms:** Stretched, squished, or clipped.

**Solutions:**

1. **Aspect ratio mismatch**
   ```javascript
   // Container should be square or use proper aspect ratio
   const mascot = new EmotiveMascot3D({
       fov: 30,  // Adjust field of view if needed
   });
   ```

2. **CSS transforms interfering**
   ```css
   /* Avoid transforms on container */
   #mascot-container {
       transform: none;  /* Remove if present */
   }
   ```

---

## Audio Issues

### BPM Detection Not Working

**Symptoms:** Mascot doesn't sync to music, BPM shows 0.

**Solutions:**

1. **CORS blocking audio analysis**
   ```html
   <!-- Audio element needs crossOrigin for remote files -->
   <audio id="music" crossorigin="anonymous" src="https://..."></audio>
   ```

   ```javascript
   // Or use local/blob URLs which bypass CORS
   const blob = new Blob([audioData], { type: 'audio/mp3' });
   audio.src = URL.createObjectURL(blob);
   ```

2. **Audio context suspended**
   ```javascript
   // Browsers require user gesture to start audio
   button.addEventListener('click', async () => {
       await mascot.connectAudio(audioElement);
       audioElement.play();
   });
   ```

3. **Audio not playing yet**
   ```javascript
   // BPM detection only works while audio is playing
   audioElement.play();
   // Wait for audio to start
   audioElement.addEventListener('playing', () => {
       console.log('BPM detection active');
   });
   ```

### Audio Plays But No Visual Response

**Symptoms:** Music plays, but mascot doesn't react.

**Solutions:**

1. **Rhythm sync not enabled**
   ```javascript
   mascot.connectAudio(audioElement);
   mascot.enableRhythmSync();  // Required for visual response
   ```

2. **BPM not yet locked**
   ```javascript
   // BPM takes 5-15 seconds to lock
   // Check status:
   const status = mascot._bpmDetector?.getStatus();
   console.log('BPM Status:', status);
   ```

3. **Groove not enabled**
   ```javascript
   mascot.enableGroove();  // Enables gesture choreography
   ```

---

## Animation Issues

### Gestures Not Triggering

**Symptoms:** `express()` called but nothing happens.

**Solutions:**

1. **Invalid gesture name**
   ```javascript
   // Check available gestures
   console.log(mascot.getAvailableGestures());

   // Use valid gesture
   mascot.express('bounce');  // Not 'Bounce' or 'BOUNCE'
   ```

2. **Mascot not initialized**
   ```javascript
   // express() requires init() first
   mascot.init(container);
   mascot.start();
   mascot.express('bounce');
   ```

3. **Animation still in progress**
   ```javascript
   // Some gestures have cooldowns
   // Wait for completion or use chain()
   mascot.chain(['bounce', 'wiggle', 'pop']);
   ```

### Emotions Not Changing

**Symptoms:** `setEmotion()` called but appearance unchanged.

**Solutions:**

1. **Invalid emotion name**
   ```javascript
   // Check available emotions
   console.log(mascot.getAvailableEmotions());

   // Use valid emotion
   mascot.setEmotion('joy');  // Correct
   mascot.setEmotion('happy');  // Wrong - use 'joy'
   ```

2. **Already in that emotion**
   ```javascript
   // Setting same emotion has no visible effect
   mascot.setEmotion('neutral');
   mascot.setEmotion('neutral');  // No change
   ```

### Morph Not Working

**Symptoms:** `morphTo()` called but geometry doesn't change.

**Solutions:**

1. **Invalid geometry name**
   ```javascript
   // Check available geometries
   console.log(mascot.getAvailableGeometries());

   // Valid geometries: 'sphere', 'heart', 'star', 'cube', 'moon'
   mascot.morphTo('heart');
   ```

2. **Already morphing**
   ```javascript
   // Wait for current morph to complete
   // Morphs take ~500ms by default
   ```

---

## Memory & Performance Issues

### Memory Keeps Growing

**Symptoms:** Browser memory usage increases over time.

**Solutions:**

1. **Not calling destroy()**
   ```javascript
   // Always clean up when done
   mascot.destroy();

   // React example
   useEffect(() => {
       const mascot = new EmotiveMascot3D({});
       mascot.init(ref.current);
       return () => mascot.destroy();
   }, []);
   ```

2. **Event listeners not removed**
   ```javascript
   // Remove listeners before destroy
   mascot.eventManager.off('emotion:change', handler);
   mascot.destroy();
   ```

3. **Audio context not closed**
   ```javascript
   // Disconnect audio before destroying
   mascot.disconnectAudio();
   mascot.destroy();
   ```

### Laggy/Stuttering Animation

**Symptoms:** Animation not smooth, FPS drops.

**Solutions:**

1. **Too many particles**
   ```javascript
   const mascot = new EmotiveMascot3D({
       particleCount: 50,  // Reduce from default 200
   });
   ```

2. **Post-processing too heavy**
   ```javascript
   const mascot = new EmotiveMascot3D({
       enablePostProcessing: false,  // Disable bloom/glow
   });
   ```

3. **Multiple mascots**
   ```javascript
   // Limit to 2-3 instances
   // Use 2D mode for additional mascots
   ```

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed optimization guide.

---

## Framework Integration Issues

### React: Mascot Disappears on Re-render

**Symptoms:** Mascot shows briefly then vanishes.

**Solution:**
```javascript
// Use refs and proper cleanup
const containerRef = useRef(null);
const mascotRef = useRef(null);

useEffect(() => {
    if (!containerRef.current) return;

    mascotRef.current = new EmotiveMascot3D({ /* config */ });
    mascotRef.current.init(containerRef.current);
    mascotRef.current.start();

    return () => {
        mascotRef.current?.destroy();
        mascotRef.current = null;
    };
}, []); // Empty deps = mount/unmount only

return <div ref={containerRef} style={{ width: 300, height: 300 }} />;
```

### Vue: Mascot Not Updating

**Symptoms:** State changes don't affect mascot.

**Solution:**
```javascript
// Don't make mascot reactive
let mascot = null;  // Not ref() or reactive()

onMounted(() => {
    mascot = new EmotiveMascot3D({ /* config */ });
    mascot.init(container.value);
    mascot.start();
});

// Update via methods, not reactivity
const setMood = (emotion) => {
    mascot?.setEmotion(emotion);
};

onUnmounted(() => {
    mascot?.destroy();
});
```

### Next.js/SSR: Window Not Defined

**Symptoms:** `ReferenceError: window is not defined`

**Solution:**
```javascript
// Dynamic import with no SSR
import dynamic from 'next/dynamic';

const MascotComponent = dynamic(
    () => import('../components/Mascot'),
    { ssr: false }
);

// Or check for browser
useEffect(() => {
    if (typeof window === 'undefined') return;

    const { EmotiveMascot3D } = await import('emotive-engine/3d');
    // ... initialize
}, []);
```

---

## Error Messages

### "Unknown emotion: X"

```
[EmotiveMascot3D] Unknown emotion: happy. Valid emotions: joy, sadness, ...
```

**Cause:** Invalid emotion name passed to `setEmotion()`.

**Fix:** Use one of the valid emotion names listed in the warning.

### "Unknown gesture: X"

```
[EmotiveMascot3D] Unknown gesture: jump. Valid gestures: bounce, pop, ...
```

**Cause:** Invalid gesture name passed to `express()`.

**Fix:** Use one of the valid gesture names listed in the warning.

### "Cannot read properties of null"

```
TypeError: Cannot read properties of null (reading 'xxx')
```

**Cause:** Calling methods after `destroy()` or before `init()`.

**Fix:** Check initialization state and don't use destroyed instances.

### "WebGL context lost"

```
THREE.WebGLRenderer: Context Lost
```

**Cause:** GPU resource exhaustion or driver issues.

**Fix:**
1. Reduce number of WebGL contexts
2. Call `destroy()` on unused mascots
3. Reduce quality settings
4. Update graphics drivers

---

## Getting Help

If your issue isn't covered here:

1. **Check the console** for warnings with `[EmotiveMascot]` prefix
2. **Check browser DevTools** Network and Console tabs
3. **Enable debug mode** (if available) for verbose logging
4. **File an issue** at [GitHub Issues](https://github.com/your-repo/issues)

Include:
- Browser and version
- Device type (desktop/mobile)
- Minimal reproduction code
- Console errors/warnings
- Expected vs actual behavior
