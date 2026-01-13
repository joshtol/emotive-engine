# Performance Tuning Guide

This guide helps you optimize Emotive Engine for different devices and use cases.

## Quick Start: Quality Presets

### High Quality (Desktop, 60+ FPS target)
```javascript
const mascot = new EmotiveMascot3D({
    enablePostProcessing: true,
    enableShadows: true,
    particleCount: 200,
    enableControls: true
});
mascot.enableParticles();
mascot.enableCrystalSoul();
```

### Medium Quality (Laptop, 30-60 FPS target)
```javascript
const mascot = new EmotiveMascot3D({
    enablePostProcessing: true,
    enableShadows: false,  // Shadows are expensive
    particleCount: 100,
    enableControls: true
});
mascot.enableParticles();
// Skip CrystalSoul for better performance
```

### Low Quality (Mobile, 30 FPS target)
```javascript
const mascot = new EmotiveMascot3D({
    enablePostProcessing: false,  // Big performance gain
    enableShadows: false,
    particleCount: 50,
    enableControls: false  // Touch-only on mobile
});
// Skip particles entirely on low-end devices
```

### Minimal (Background/Ambient, 15-30 FPS acceptable)
```javascript
const mascot = new EmotiveMascot3D({
    enablePostProcessing: false,
    enableShadows: false,
    particleCount: 0,
    enableControls: false
});
// Pure geometry only
```

---

## FPS Targets by Device

| Device Category | Target FPS | Recommended Preset |
|-----------------|------------|-------------------|
| Desktop (dedicated GPU) | 60+ | High |
| Laptop (integrated GPU) | 30-60 | Medium |
| Tablet | 30-45 | Medium/Low |
| Mobile (high-end) | 30 | Low |
| Mobile (mid-range) | 24-30 | Low/Minimal |
| Mobile (low-end) | 15-24 | Minimal |

---

## Performance Impact by Feature

Features sorted by GPU cost (highest to lowest):

| Feature | GPU Cost | CPU Cost | Disable With |
|---------|----------|----------|--------------|
| Post-processing (bloom, glow) | **Very High** | Low | `enablePostProcessing: false` |
| Shadows | **High** | Medium | `enableShadows: false` |
| CrystalSoul effect | **High** | Low | Don't call `enableCrystalSoul()` |
| Particles (200) | Medium | Medium | `disableParticles()` or `particleCount: 0` |
| Particles (50) | Low | Low | - |
| Geometry morphing | Low | Medium | Reduce morph frequency |
| Emotions/gestures | Very Low | Low | - |
| Base geometry | Very Low | Very Low | - |

---

## Automatic Performance Degradation

Emotive Engine includes a `DegradationManager` that automatically reduces quality when frame rate drops. This is enabled by default.

### How It Works

1. **Monitors FPS** every 500ms
2. **Triggers degradation** if FPS drops below threshold for 3+ consecutive checks
3. **Reduces quality** in stages:
   - Stage 1: Reduce particle count by 50%
   - Stage 2: Disable post-processing
   - Stage 3: Disable particles entirely

### Configuring Degradation

```javascript
// Access via internal API (advanced)
mascot._degradationManager.setThresholds({
    fpsThreshold: 24,        // Trigger below this FPS
    checkInterval: 500,      // Check every N ms
    degradationSteps: 3      // Number of quality stages
});
```

### Disabling Automatic Degradation

```javascript
// Start with lowest quality to avoid degradation entirely
const mascot = new EmotiveMascot3D({
    enablePostProcessing: false,
    enableShadows: false,
    particleCount: 0
});
```

---

## Profiling Your Application

### Chrome DevTools

1. **Open DevTools** (F12)
2. **Performance tab** → Click Record
3. **Interact with mascot** for 5-10 seconds
4. **Stop recording** and analyze

**What to look for:**
- Long frames (>16ms for 60 FPS, >33ms for 30 FPS)
- JavaScript execution time in animation frame
- GPU paint time

### FPS Meter

Enable Chrome's FPS meter:
1. DevTools → More tools → Rendering
2. Check "FPS meter"

### Three.js Stats

For detailed Three.js metrics, add stats to your page:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js"></script>
<script>
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(stats.dom);

    function animate() {
        stats.begin();
        // Your render loop here
        stats.end();
        requestAnimationFrame(animate);
    }
    animate();
</script>
```

---

## Memory Management

### Cleanup on Unmount

Always call `destroy()` when removing the mascot:

```javascript
// React useEffect cleanup
useEffect(() => {
    const mascot = new EmotiveMascot3D({ /* config */ });
    mascot.init(containerRef.current);
    mascot.start();

    return () => {
        mascot.destroy(); // Critical for memory cleanup
    };
}, []);
```

### Multi-Instance Memory

Each mascot instance creates:
- WebGL context (~10-50MB GPU memory)
- Audio context (if rhythm sync enabled)
- Animation frame subscription

**Recommendation:** Limit to 2-3 simultaneous mascot instances.

### Detecting Memory Leaks

1. **Chrome DevTools** → Memory tab
2. **Take heap snapshot** before creating mascot
3. **Create and destroy** mascot multiple times
4. **Take another snapshot**
5. **Compare** - retained objects indicate leaks

---

## Mobile Optimization Checklist

- [ ] Disable post-processing (`enablePostProcessing: false`)
- [ ] Disable shadows (`enableShadows: false`)
- [ ] Reduce or disable particles (`particleCount: 50` or less)
- [ ] Use 2D mode for very low-end devices
- [ ] Test on actual devices, not just emulators
- [ ] Consider `prefers-reduced-motion` for accessibility

---

## Audio/Rhythm Sync Performance

BPM detection and audio analysis add CPU overhead:

```javascript
// High performance (no audio)
const mascot = new EmotiveMascot3D({ /* config */ });
// Don't call connectAudio() or enableRhythmSync()

// Medium performance (BPM only)
mascot.connectAudio(audioElement);
// BPM detection runs in background

// Lower performance (full sync)
mascot.connectAudio(audioElement);
mascot.enableRhythmSync();
mascot.enableGroove();
// Full audio-reactive animation
```

---

## Benchmarks

Typical performance on reference hardware:

| Config | MacBook Pro M1 | iPhone 13 | Pixel 6 |
|--------|----------------|-----------|---------|
| High | 60 FPS | 45 FPS | 35 FPS |
| Medium | 60 FPS | 55 FPS | 45 FPS |
| Low | 60 FPS | 60 FPS | 55 FPS |
| Minimal | 60 FPS | 60 FPS | 60 FPS |

*Benchmarks measured with default geometry, no audio sync.*

---

## Troubleshooting Performance Issues

### Symptom: Consistent low FPS
- Check if post-processing is enabled
- Reduce particle count
- Try 2D mode instead of 3D

### Symptom: FPS drops during gestures
- Reduce gesture frequency in DanceChoreographer
- Disable complex gesture chains

### Symptom: Memory grows over time
- Ensure `destroy()` is called on cleanup
- Check for event listener leaks
- Verify audio context is released

### Symptom: Initial load is slow
- Preload textures if using moon/eclipse effects
- Consider lazy-loading 3D module

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more issues and solutions.
