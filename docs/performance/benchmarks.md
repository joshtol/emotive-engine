# Emotive Engine - Performance Benchmarks

## Bundle Size Analysis

### Production Builds (v2.5.1)

| Build Variant | Raw Size | Gzipped | Modules | Use Case |
|---------------|----------|---------|---------|----------|
| **Full (UMD)** | 864.6 KB | 233.56 KB | 324 | Complete feature set |
| **Minimal** | ~700 KB | ~190 KB | ~250 | Core animations only |
| **Audio** | 819.5 KB | 221.3 KB | ~310 | Audio-reactive focus |

### Bundle Composition (Full Build)

Top contributors to bundle size:

1. **Sentry Replay** (10.46%, 300.6 KB) - Error monitoring & session replay
2. **EmotiveRenderer** (5.15%, 147.9 KB) - Core rendering engine
3. **EmotiveMascot** (3.40%, 97.6 KB) - Main controller
4. **GestureAnimator** (2.02%, 58.2 KB) - Gesture animations
5. **ParticleSystem** (1.71%, 49.0 KB) - Particle physics
6. **ShapeMorpher** (1.68%, 48.4 KB) - Shape transformations
7. **EmotiveMascotPublic** (1.64%, 47.2 KB) - Public API wrapper
8. **SoundSystem** (1.23%, 35.2 KB) - Audio integration
9. **Sentry Core** (1.21%, 34.7 KB) - Error tracking
10. **DegradationManager** (1.10%, 31.5 KB) - Performance adaptation

**Optimization Opportunity**: Sentry adds ~335 KB (11.67%). Consider making it optional for production builds.

## Runtime Performance

### Frame Rate (FPS)

Target: **60 FPS** (16.67ms frame budget)

#### Desktop Performance

| Browser | Particle Count | Average FPS | Frame Time | Notes |
|---------|----------------|-------------|------------|-------|
| Chrome 120+ | 300 | 60 | 14-16ms | ✅ Optimal |
| Chrome 120+ | 500 | 58-60 | 16-18ms | ✅ Good |
| Chrome 120+ | 1000 | 45-55 | 20-25ms | ⚠️ Degraded |
| Firefox 121+ | 300 | 60 | 14-16ms | ✅ Optimal |
| Firefox 121+ | 500 | 55-60 | 17-19ms | ✅ Good |
| Safari 17+ | 300 | 60 | 14-16ms | ✅ Optimal |
| Safari 17+ | 500 | 52-58 | 18-21ms | ⚠️ Variable |
| Edge 120+ | 300 | 60 | 14-16ms | ✅ Optimal |

**Test Conditions**:
- CPU: Intel i5-12600K / AMD Ryzen 5 5600X
- Resolution: 1920x1080
- Emotion: joy with undertone
- 2-3 active gestures

#### Mobile Performance

| Device | Particle Count | Average FPS | Frame Time | Notes |
|--------|----------------|-------------|------------|-------|
| iPhone 14 Pro (iOS 17) | 200 | 60 | 15-17ms | ✅ Optimal |
| iPhone 14 Pro (iOS 17) | 300 | 50-55 | 18-22ms | ⚠️ Variable |
| Samsung S23 (Chrome) | 200 | 58-60 | 16-18ms | ✅ Good |
| Samsung S23 (Chrome) | 300 | 45-52 | 20-25ms | ⚠️ Degraded |
| iPad Pro 2022 | 300 | 60 | 15-17ms | ✅ Optimal |
| iPad Pro 2022 | 500 | 55-60 | 17-20ms | ✅ Good |

**Mobile Optimization**:
- Auto-reduces particles on low-end devices
- Disables particle physics below 30 FPS
- Reduces glow effects on battery saver mode

### Memory Usage

| Configuration | Heap Size | Particle Pool | Total |
|---------------|-----------|---------------|-------|
| Low (150 particles) | ~8 MB | ~1.2 MB | ~9.2 MB |
| Medium (300 particles) | ~12 MB | ~2.4 MB | ~14.4 MB |
| High (500 particles) | ~18 MB | ~4 MB | ~22 MB |

**Memory Stability**: No memory leaks detected after 1 hour continuous operation.

### Initialization Time

| Metric | Time | Notes |
|--------|------|-------|
| Cold start (full) | 120-180ms | Includes Sentry init |
| Cold start (minimal) | 80-120ms | Core only |
| Warm start | 40-60ms | Cached modules |
| Canvas ready | 20-30ms | After init |
| First paint | 50-80ms | Initial render |

### Animation Performance

| Animation Type | CPU Impact | GPU Impact | Notes |
|----------------|------------|------------|-------|
| Emotion transition | Low (2-4%) | Low | Smooth interpolation |
| Gesture (single) | Low (3-5%) | Medium | Canvas transforms |
| Gesture (chain 3+) | Medium (8-12%) | Medium | Multiple simultaneous |
| Shape morph | Medium (5-8%) | Low | Path calculations |
| Audio-reactive | Medium (10-15%) | Low | FFT analysis |
| Particle burst | High (15-25%) | High | Physics simulation |

## Degradation Strategy

### Automatic Quality Reduction

The engine automatically degrades quality when FPS drops below targets:

| FPS Range | Action | Particle Reduction |
|-----------|--------|-------------------|
| 55-60 | None | 0% |
| 45-55 | Level 1 | -20% (e.g., 300→240) |
| 35-45 | Level 2 | -40% (e.g., 300→180) |
| 25-35 | Level 3 | -60% (e.g., 300→120) |
| <25 | Level 4 | -80% (e.g., 300→60) |

**Recovery**: Quality automatically restores when FPS improves for 3+ seconds.

## Test Coverage

### Current Coverage (v2.5.1)

```
Overall:        66.76% statements
                69.19% branches
                15.03% functions
                66.76% lines
```

### Coverage by Module

| Module | Coverage | Test Count | Status |
|--------|----------|------------|--------|
| **Core Mascot** | 87.99% | 156 | ✅ Excellent |
| ConfigurationManager | 100% | 26 | ✅ Complete |
| GestureController | 99.25% | 43 | ✅ Excellent |
| StateCoordinator | 100% | 22 | ✅ Complete |
| AudioHandler | 88.71% | 40 | ✅ Excellent |
| **Utils** | 44.17% | 111 | ⚠️ Needs work |
| colorUtils | 99.23% | 35 | ✅ Excellent |
| easing | 100% | 33 | ✅ Complete |
| browserCompatibility | 66.47% | 15 | ⚠️ Partial |
| **Shapes** | 53.65% | 5 | ⚠️ Needs tests |
| **Plugins** | 0% | 0 | ❌ Not tested |

**Target**: 80% overall coverage by next release

## Performance Best Practices

### For Developers

1. **Particle Count**
   - Desktop: 300-500 particles
   - Mobile: 150-200 particles
   - Use `setMaxParticles()` to adjust

2. **Gesture Chaining**
   - Limit to 3-4 gestures per chain
   - Use delays between gestures
   - Avoid rapid-fire triggers

3. **Audio Analysis**
   - Disable when not needed
   - Use throttling for beat detection
   - Sample rate: 44.1kHz recommended

4. **Canvas Size**
   - Don't exceed 1920x1080 on desktop
   - Scale down on mobile (max 800x600)
   - Use `setScale()` instead of canvas resize

5. **Error Monitoring**
   - Disable Sentry in development
   - Use minimal DSN config in production
   - Consider conditional loading

### Production Checklist

- [ ] Set appropriate particle count for target devices
- [ ] Configure degradation thresholds
- [ ] Enable production mode (minified builds)
- [ ] Load from CDN when possible
- [ ] Implement lazy loading for heavy features
- [ ] Monitor FPS in production with `getPerformanceMetrics()`
- [ ] Set up error tracking with appropriate sample rate
- [ ] Test on target mobile devices

## Benchmarking Tools

### Built-in Performance Monitoring

```javascript
const mascot = new EmotiveMascot({ canvasId: 'mascot' });

// Get real-time metrics
const metrics = mascot.getPerformanceMetrics();
console.log('FPS:', metrics.fps);
console.log('Frame time:', metrics.frameTime, 'ms');
console.log('Particles:', metrics.particleCount);
```

### External Tools

- **Chrome DevTools**: Performance profiler, frame rate meter
- **Firefox Developer Tools**: Performance timeline
- **Safari Web Inspector**: Timelines and rendering frames
- **Lighthouse**: Overall performance score
- **WebPageTest**: Load time analysis

## Optimization Roadmap

### Planned Improvements

1. **Tree-shaking enhancement** - Reduce minimal build by 30%
2. **WebWorker support** - Offload physics calculations
3. **WebGL renderer option** - For 1000+ particles
4. **Lazy load Sentry** - Save 300KB on initial load
5. **Shared particle pool** - Reduce memory by 40%
6. **Compressed emotion data** - Save ~20KB
7. **Virtual scrolling** for gestures - Faster gesture loading

### Known Limitations

- Canvas 2D performance ceiling: ~500 particles @ 60fps
- Safari has variable performance with complex gradients
- Mobile Safari throttles on battery saver mode
- Audio analysis adds 10-15% CPU overhead
- Sentry adds 11% to bundle size

---

**Last Updated**: 2025-10-17
**Engine Version**: 2.5.1
**Test Environment**: Chrome 120, Node 20.x, Windows 11 / macOS 14
