---
name: performance-auditor
description:
    Audit, optimize, and maintain 60fps performance for emotive-mascot
    animations. Use when diagnosing performance issues, optimizing particle
    systems, reducing bundle size, or ensuring smooth animations across devices.
trigger:
    performance, optimization, fps, lag, slow, bundle size, mobile performance
---

# Performance Auditor

You are an expert in optimizing the emotive-mascot engine for maximum
performance across all devices.

## When to Use This Skill

- Diagnosing frame rate drops or stuttering
- Optimizing particle counts and physics calculations
- Reducing bundle size
- Improving mobile performance
- Auditing render performance
- Profiling animation bottlenecks
- Memory leak investigation

## Performance Targets

### Frame Rate

- **Desktop**: 60 FPS consistent
- **Mobile**: 30-60 FPS (adaptive)
- **Low-end devices**: 30 FPS minimum

### Bundle Size

- **Full bundle**: < 250 KB gzipped
- **Minimal bundle**: < 120 KB gzipped
- **Audio bundle**: < 200 KB gzipped

### Memory

- **Initial load**: < 50 MB
- **Runtime peak**: < 100 MB
- **No memory leaks** over extended use

### Particle Counts

- **Desktop**: 800-1000 particles max
- **Mobile**: 400-600 particles max
- **Low-end**: 200-400 particles max

## Diagnostic Tools

### Built-in Performance Monitor

```javascript
const mascot = new EmotiveMascot({
    containerId: 'mascot',
    debug: true, // Enables FPS counter and debug overlay
});

// Access performance stats
mascot.getPerformanceStats();
// Returns:
// {
//   fps: 60,
//   frameTime: 16.67,
//   particleCount: 800,
//   memoryUsage: 45.2,
//   renderTime: 12.3
// }
```

### Browser DevTools Profiling

```javascript
// Start profiling
performance.mark('mascot-start');

await mascot.transitionTo('joy', { duration: 1000 });

performance.mark('mascot-end');
performance.measure('mascot-transition', 'mascot-start', 'mascot-end');

const measures = performance.getEntriesByName('mascot-transition');
console.log('Transition took:', measures[0].duration, 'ms');
```

### Chrome Performance Tab

1. Open DevTools → Performance tab
2. Click Record
3. Interact with mascot (emotion changes, gestures)
4. Stop recording
5. Analyze:
    - **Main thread**: Look for long tasks (>50ms)
    - **Frames**: Check for frame drops (red bars)
    - **Memory**: Check for growth over time

## Common Performance Issues

### Issue 1: Low Frame Rate

**Symptoms**: FPS < 60 on desktop, stuttering animations

**Diagnosis**:

```javascript
// Check particle count
console.log(mascot.getCurrentParticleCount());

// Check render time
const stats = mascot.getPerformanceStats();
console.log('Render time:', stats.renderTime, 'ms');
```

**Solutions**:

1. Reduce particle count in emotion configs
2. Optimize physics calculations
3. Reduce trail length
4. Disable glow effects on low-end devices

**Example fix**:

```javascript
// Before (laggy)
joy: {
  particleCount: 1200,
  trailLength: 15,
  glow: true
}

// After (optimized)
joy: {
  particleCount: 800,
  trailLength: 5,
  glow: false  // or conditional based on device
}
```

### Issue 2: Mobile Performance

**Symptoms**: Slow on mobile, high battery drain

**Diagnosis**:

```javascript
// Detect mobile and adjust
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
const isLowEnd = navigator.hardwareConcurrency <= 4;

console.log('Mobile:', isMobile, 'Low-end:', isLowEnd);
```

**Solutions**:

1. Adaptive particle counts
2. Lower target FPS (30 instead of 60)
3. Disable expensive features
4. Use requestAnimationFrame throttling

**Example fix**:

```javascript
const mascotConfig = {
    containerId: 'mascot',
    targetFPS: isMobile ? 30 : 60,
    enableGazeTracking: !isMobile,
    audioEnabled: !isLowEnd,
    particleMultiplier: isMobile ? 0.6 : 1.0,
};

const mascot = new EmotiveMascot(mascotConfig);
```

### Issue 3: Memory Leaks

**Symptoms**: Memory usage grows over time, page slows down

**Diagnosis**:

```javascript
// Monitor memory over time
setInterval(() => {
    if (performance.memory) {
        console.log('Memory:', {
            used:
                (performance.memory.usedJSHeapSize / 1048576).toFixed(2) +
                ' MB',
            total:
                (performance.memory.totalJSHeapSize / 1048576).toFixed(2) +
                ' MB',
        });
    }
}, 5000);
```

**Common causes**:

- Event listeners not removed
- Particles not cleaned up
- Animation frames not cancelled
- Canvas contexts not released

**Solutions**:

```javascript
// Proper cleanup in React
useEffect(() => {
    const mascot = new EmotiveMascot({ containerId: 'mascot' });
    mascot.initialize();

    return () => {
        mascot.destroy(); // Critical: cleanup on unmount
    };
}, []);

// Manual cleanup
mascot.destroy(); // Removes listeners, stops animation, clears particles
```

### Issue 4: Large Bundle Size

**Symptoms**: Slow initial load, high bandwidth usage

**Diagnosis**:

```bash
# Check bundle size
npm run build
ls -lh dist/

# Analyze bundle composition
npm run build:analyze
```

**Solutions**:

1. Use code splitting
2. Import only needed features
3. Use minimal build
4. Enable tree-shaking

**Example fixes**:

```javascript
// Import only needed features
import { EmotiveMascot } from '@joshtol/emotive-engine/minimal';

// Dynamic import
const loadMascot = async () => {
    const { EmotiveMascot } = await import('@joshtol/emotive-engine');
    return new EmotiveMascot({ containerId: 'mascot' });
};

// Lazy load audio module
const loadAudio = async () => {
    const { AudioEngine } = await import('@joshtol/emotive-engine/audio');
    return new AudioEngine();
};
```

## Optimization Techniques

### 1. Particle Pool Recycling

Instead of creating/destroying particles, reuse them:

```javascript
// In PhysicsEngine.js
class ParticlePool {
    constructor(maxSize = 1000) {
        this.pool = [];
        this.active = [];
        this.maxSize = maxSize;
    }

    acquire() {
        return this.pool.pop() || this.createParticle();
    }

    release(particle) {
        if (this.pool.length < this.maxSize) {
            particle.reset();
            this.pool.push(particle);
        }
    }
}
```

### 2. Adaptive Quality

Automatically adjust quality based on performance:

```javascript
class AdaptiveQualityManager {
    constructor(mascot) {
        this.mascot = mascot;
        this.targetFPS = 60;
        this.currentFPS = 60;
        this.checkInterval = 1000; // Check every second
    }

    monitor() {
        setInterval(() => {
            const stats = this.mascot.getPerformanceStats();
            this.currentFPS = stats.fps;

            if (this.currentFPS < this.targetFPS - 10) {
                this.reduceQuality();
            } else if (this.currentFPS >= this.targetFPS) {
                this.increaseQuality();
            }
        }, this.checkInterval);
    }

    reduceQuality() {
        // Reduce particle count by 20%
        this.mascot.setParticleMultiplier(0.8);
        // Disable trails
        this.mascot.setTrailsEnabled(false);
    }

    increaseQuality() {
        // Restore particle count
        this.mascot.setParticleMultiplier(1.0);
        // Enable trails
        this.mascot.setTrailsEnabled(true);
    }
}
```

### 3. Render Optimization

Minimize canvas operations:

```javascript
// Batch operations
ctx.save();
// ... multiple operations
ctx.restore();

// Use transforms instead of recalculating
ctx.translate(x, y);
ctx.rotate(angle);
// ... draw
ctx.resetTransform();

// Avoid unnecessary state changes
const prevFillStyle = ctx.fillStyle;
if (prevFillStyle !== newColor) {
    ctx.fillStyle = newColor;
}
```

### 4. Physics Optimization

Reduce physics calculations:

```javascript
// Spatial partitioning for collision detection
class SpatialGrid {
    constructor(cellSize = 50) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    insert(particle) {
        const cellX = Math.floor(particle.x / this.cellSize);
        const cellY = Math.floor(particle.y / this.cellSize);
        const key = `${cellX},${cellY}`;

        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(particle);
    }

    getNearby(particle) {
        const cellX = Math.floor(particle.x / this.cellSize);
        const cellY = Math.floor(particle.y / this.cellSize);
        const nearby = [];

        // Check 3x3 grid around particle
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cellX + dx},${cellY + dy}`;
                if (this.grid.has(key)) {
                    nearby.push(...this.grid.get(key));
                }
            }
        }

        return nearby;
    }
}
```

## Performance Checklist

### Before Release

- [ ] Test on low-end mobile devices (iPhone SE, Android mid-range)
- [ ] Profile with Chrome DevTools Performance tab
- [ ] Check bundle size (< 250 KB gzipped)
- [ ] Verify no memory leaks over 5 minutes
- [ ] Test with 1000+ particles on desktop
- [ ] Test with 400 particles on mobile
- [ ] Verify 60fps on desktop, 30fps on mobile
- [ ] Check battery drain on mobile (< 5% per 10 minutes)

### During Development

- [ ] Use `debug: true` to monitor FPS
- [ ] Profile each new emotion/gesture
- [ ] Test transitions between all emotions
- [ ] Check memory usage after each feature
- [ ] Verify cleanup in React/Vue components

### Production Monitoring

- [ ] Track FPS metrics in analytics
- [ ] Monitor bundle load time
- [ ] Track memory usage patterns
- [ ] Monitor device performance distribution

## Profiling Script

```javascript
// Add to demo pages for quick profiling
class PerformanceProfiler {
    constructor(mascot) {
        this.mascot = mascot;
        this.results = [];
    }

    async profileEmotion(emotion, duration = 5000) {
        console.log(`Profiling ${emotion}...`);

        const startMem = performance.memory?.usedJSHeapSize || 0;
        const startTime = performance.now();
        let frameCount = 0;
        let totalFrameTime = 0;

        const measureFrame = () => {
            const frameStart = performance.now();
            frameCount++;
            const frameTime = performance.now() - frameStart;
            totalFrameTime += frameTime;
        };

        const interval = setInterval(measureFrame, 16);

        await this.mascot.transitionTo(emotion);
        await new Promise(resolve => setTimeout(resolve, duration));

        clearInterval(interval);

        const endTime = performance.now();
        const endMem = performance.memory?.usedJSHeapSize || 0;

        const result = {
            emotion,
            avgFPS: frameCount / (duration / 1000),
            avgFrameTime: totalFrameTime / frameCount,
            memoryDelta: (endMem - startMem) / 1048576,
            totalTime: endTime - startTime,
        };

        this.results.push(result);
        console.table(result);

        return result;
    }

    async profileAll(emotions = ['calm', 'joy', 'excitement', 'focus']) {
        for (const emotion of emotions) {
            await this.profileEmotion(emotion);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('=== PERFORMANCE SUMMARY ===');
        console.table(this.results);

        return this.results;
    }
}

// Usage:
const profiler = new PerformanceProfiler(mascot);
await profiler.profileAll();
```

## Bundle Size Optimization

### Current bundle sizes:

```json
{
    "emotive-mascot.umd.js": "900 KB uncompressed, 234 KB gzipped",
    "emotive-mascot.minimal.js": "400 KB uncompressed, 120 KB gzipped",
    "emotive-mascot.audio.js": "700 KB uncompressed, 200 KB gzipped"
}
```

### Reducing bundle size:

```javascript
// rollup.config.js optimizations
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
    plugins: [
        terser({
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.debug'],
            },
            mangle: {
                properties: {
                    regex: /^_/, // Mangle private properties
                },
            },
        }),
        visualizer({
            filename: 'bundle-analysis.html',
            open: true,
        }),
    ],
    treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
    },
};
```

## Key Files

- **Performance Monitor**: `src/core/PerformanceMonitor.js`
- **Physics Engine**: `src/core/PhysicsEngine.js`
- **Particle System**: `src/core/ParticleSystem.js`
- **Render Engine**: `src/core/RenderEngine.js`
- **Bundle Config**: `rollup.config.js`
- **Package Config**: `package.json` (bundlesize settings)

## Resources

- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Canvas Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [Bundle Size Guide](../../docs/bundle-optimization.md)
