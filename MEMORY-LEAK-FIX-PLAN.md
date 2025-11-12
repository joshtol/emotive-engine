# Memory Leak Fix Plan - Emotive Engine

**Created:** 2025-11-12 **Based on:** Comprehensive memory leak audit
verification across 10 subsystems **Total Issues:** 93 reported → 78 verified
(15 false positives removed) **Estimated Total Fix Time:** 40-60 hours

---

## 🔴 Week 1: Critical Issues (Must Fix Immediately)

**Estimated Time:** 16-24 hours **Impact:** Prevents 50-150MB memory leaks and
critical failures

### Priority 0 - Critical Memory Leaks

#### 1. GestureScheduler - setInterval Never Cleared (4-6 hours)

**Files:** `src/core/GestureScheduler.js` **Issue:** setInterval runs at 60fps
forever, setTimeout tracking missing **Impact:** Severe CPU and memory waste,
hundreds of orphaned timers

**Fix:**

```javascript
class GestureScheduler {
    constructor() {
        this.processInterval = null;
        this.pendingTimeouts = new Set(); // Track all setTimeout IDs
        // ... existing code ...
    }

    executeGesture(queueItem) {
        // ... existing code ...

        const timeoutId = setTimeout(() => {
            // ... existing timeout code ...
            this.pendingTimeouts.delete(timeoutId); // Clean up when done
        }, duration);

        this.pendingTimeouts.add(timeoutId); // Track timeout
    }

    destroy() {
        // Stop the main processing interval
        this.stopProcessing();

        // Clear all pending gesture timeouts
        this.pendingTimeouts.forEach(id => clearTimeout(id));
        this.pendingTimeouts.clear();

        // Clear data structures
        this.queue = [];
        this.activeGestures.clear();
        this.gestureQueues.clear();

        // Remove rhythm engine event listeners
        if (this.rhythmEngine) {
            this.rhythmEngine.removeEventListener('beat', this.onBeatHandler);
            this.rhythmEngine.removeEventListener(
                'measure',
                this.onMeasureHandler
            );
        }

        // Null references
        this.onGestureQueued = null;
        this.onGestureTriggered = null;
        this.onGestureCompleted = null;
    }
}
```

**Testing:**

- Create 1000 gestures, call destroy(), verify no timers remain
- Use `performance.memory` to confirm memory returns to baseline

---

#### 2. TimelineRecorder - Playback Timers Not Tracked (3-4 hours)

**Files:** `src/public/TimelineRecorder.js` **Issue:** Creates N+1 setTimeout
calls per playback, no tracking or cancellation **Impact:** Critical - 100+
orphaned timers per timeline playback

**Fix:**

```javascript
class TimelineRecorder {
    constructor(getEngine, audioManager, state) {
        this._getEngine = getEngine;
        this._audioManager = audioManager;
        this._state = state;
        this._activeTimeouts = new Set(); // NEW: Track all timeouts
    }

    playTimeline(timeline) {
        // Clear any existing playback
        this.stopPlayback();

        this._state.isPlaying = true;
        this._state.playbackStartTime = Date.now();

        // Schedule all events with tracking
        timeline.forEach(event => {
            const timeoutId = setTimeout(() => {
                this._activeTimeouts.delete(timeoutId); // Clean up when fired
                if (!this._state.isPlaying) return;

                const engine = this._getEngine();
                if (!engine) return;

                // Execute event...
                if (event.type === 'gesture') {
                    engine.express(event.name);
                }
                // ... handle other event types ...
            }, event.time);

            this._activeTimeouts.add(timeoutId); // Track timeout
        });

        // Track stop timeout
        const lastEventTime = Math.max(...timeline.map(e => e.time));
        const stopTimeoutId = setTimeout(() => {
            this._activeTimeouts.delete(stopTimeoutId);
            this._state.isPlaying = false;
        }, lastEventTime);
        this._activeTimeouts.add(stopTimeoutId);
    }

    stopPlayback() {
        this._state.isPlaying = false;

        // Clear all pending timeouts
        this._activeTimeouts.forEach(id => clearTimeout(id));
        this._activeTimeouts.clear();
    }

    destroy() {
        this.stopPlayback();
        this._getEngine = null;
        this._audioManager = null;
        this._state = null;
    }
}
```

**Testing:**

- Play timeline with 100 events, call stopPlayback(), verify all timers cleared
- Check with Chrome DevTools -> Sources -> setTimeout that no orphans remain

---

#### 3. PMREMGenerator - HDRI Texture Leak (2-3 hours)

**Files:** `src/3d/ThreeRenderer.js` **Issue:** Two separate leaks in
environment map creation:

1. HDRI source texture not disposed after processing (5-20MB)
2. Procedural fallback cubeRenderTarget not tracked (6MB)

**Fix:**

```javascript
// In createEnvironmentMap() method

// HDRI PATH FIX (line 239-244):
const texture = await exrLoader.loadAsync('/hdri/studio_01.exr');
texture.mapping = THREE.EquirectangularReflectionMapping;
this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
texture.dispose(); // NEW: Dispose source texture
pmremGenerator.dispose();

// PROCEDURAL FALLBACK FIX (line 254-282):
const size = 512;
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size);
this._envCubeRenderTarget = cubeRenderTarget; // NEW: Store for disposal

const envScene = new THREE.Scene();
this._envScene = envScene; // NEW: Store for disposal

// ... existing scene setup ...

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
this._envCubeCamera = cubeCamera; // NEW: Store for disposal
cubeCamera.update(this.renderer, envScene);

this.envMap = cubeRenderTarget.texture;

// In destroy() method (line 1102-1106):
if (this.envMap) {
    this.envMap.dispose();
    this.envMap = null;
}

// NEW: Clean up procedural environment resources
if (this._envCubeRenderTarget) {
    this._envCubeRenderTarget.dispose();
    this._envCubeRenderTarget = null;
}

if (this._envScene) {
    // Dispose scene children (lights, etc.)
    this._envScene.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    });
    this._envScene = null;
}

if (this._envCubeCamera) {
    this._envCubeCamera = null;
}
```

**Testing:**

- Create environment map 10 times, destroy, check GPU memory doesn't accumulate
- Use Chrome DevTools -> Memory -> Take heap snapshot -> search for
  "WebGLCubeRenderTarget"

---

#### 4. GestureSoundLibrary - Map Recreation Every Frame (3-4 hours)

**Files:** `src/core/audio/GestureSoundLibrary.js` **Issue:** Creates new Map
with 30+ configs on EVERY getSoundConfig() call **Impact:** Massive memory
churn, 15KB+ allocations per call × 10-60 calls/sec

**Fix:**

```javascript
class GestureSoundLibrary {
    // MOVE Map to static class property
    static GESTURE_SOUNDS = new Map([
        [
            'bounce',
            {
                frequencies: [200, 400, 600],
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.2,
                },
                // ... rest of config ...
            },
        ],
        [
            'pulse',
            {
                /* config */
            },
        ],
        // ... all 30 gestures ...
    ]);

    static getSoundConfig(gestureId) {
        return GestureSoundLibrary.GESTURE_SOUNDS.get(gestureId) || null;
    }
}
```

**Testing:**

- Profile with Chrome DevTools -> Memory -> Allocation instrumentation
- Call getSoundConfig() 1000 times, verify no new Map allocations
- Compare memory before/after fix with 1-minute gesture performance

---

#### 5. SoundSystem.emotionalModifiers - Map Recreation (2-3 hours)

**Files:** `src/core/audio/SoundSystem.js` **Issue:** Creates new Map with 8
emotion configs every call **Impact:** Called for every gesture sound, creates
unnecessary allocations

**Fix:**

```javascript
class SoundSystem {
    constructor(audioContext) {
        this.audioContext = audioContext;

        // MOVE to instance property (created once)
        this.emotionalModifiers = new Map([
            ['neutral', { intensity: 1.0, speed: 1.0 }],
            ['joy', { intensity: 1.3, speed: 1.2 }],
            ['sadness', { intensity: 0.7, speed: 0.8 }],
            ['anger', { intensity: 1.5, speed: 1.3 }],
            ['fear', { intensity: 1.2, speed: 1.4 }],
            ['surprise', { intensity: 1.4, speed: 1.5 }],
            ['disgust', { intensity: 0.9, speed: 0.9 }],
            ['love', { intensity: 1.1, speed: 1.0 }],
        ]);
    }

    getEmotionalModifiers(emotion) {
        return (
            this.emotionalModifiers.get(emotion) ||
            this.emotionalModifiers.get('neutral')
        );
    }
}
```

**Testing:**

- Profile allocation rate before/after
- Verify emotional modifiers still apply correctly to sounds
- Run 100 gestures across different emotions, check memory stable

---

#### 6. WebGL Context Loss Handlers (2-3 hours)

**Files:** `src/3d/ThreeRenderer.js` **Issue:** Missing
webglcontextlost/restored handlers causes app freeze on mobile **Impact:**
Critical for mobile - context loss is common under memory pressure

**Fix:**

```javascript
constructor(canvas) {
    // ... existing constructor code ...

    // Bind handlers for removal later
    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);

    // Add context loss handlers
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);

    this._contextLost = false;
}

handleContextLost(event) {
    event.preventDefault(); // Prevent default context loss behavior
    this._contextLost = true;
    console.warn('WebGL context lost - halting rendering');

    // Stop animation loop if running
    if (this.animationLoopId) {
        cancelAnimationFrame(this.animationLoopId);
        this.animationLoopId = null;
    }
}

handleContextRestored() {
    this._contextLost = false;
    console.log('WebGL context restored - recreating resources');

    // Option 1: Reload entire scene
    this.recreateResources();

    // Option 2: Notify application to reload
    if (this.onContextRestored) {
        this.onContextRestored();
    }
}

recreateResources() {
    // Recreate essential resources
    // This is application-specific - may need to reload textures, geometries, etc.
    console.log('WebGL resources need to be recreated');
}

destroy() {
    // ... existing cleanup ...

    // Remove context loss handlers
    if (this.renderer?.domElement) {
        this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
        this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);
    }

    // ... rest of cleanup ...
}
```

**Testing:**

- Use Chrome DevTools -> Rendering -> Emulate: "Lose WebGL context"
- Verify app doesn't freeze
- Test on actual mobile device under memory pressure

---

#### 7. CanvasContextRecovery Event Listeners (1-2 hours)

**Files:** `src/utils/browserCompatibility.js` **Issue:** Two event listeners
added but never removed, no destroy() method **Impact:** 2 permanent listeners
per instance

**Fix:**

```javascript
class CanvasContextRecovery {
    constructor(canvas) {
        this.canvas = canvas;
        this.isContextLost = false;
        this.recoveryCallbacks = [];

        // Bind handlers for removal
        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleContextRestored = this.handleContextRestored.bind(this);

        this.canvas.addEventListener(
            'webglcontextlost',
            this.handleContextLost
        );
        this.canvas.addEventListener(
            'webglcontextrestored',
            this.handleContextRestored
        );
    }

    handleContextLost(event) {
        event.preventDefault();
        this.isContextLost = true;
        console.warn('Canvas WebGL context lost');
    }

    handleContextRestored() {
        this.isContextLost = false;
        console.log('Canvas WebGL context restored');

        // Execute recovery callbacks
        this.recoveryCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Context recovery callback error:', error);
            }
        });
    }

    // NEW: Add destroy method
    destroy() {
        if (this.canvas) {
            this.canvas.removeEventListener(
                'webglcontextlost',
                this.handleContextLost
            );
            this.canvas.removeEventListener(
                'webglcontextrestored',
                this.handleContextRestored
            );
            this.canvas = null;
        }
        this.recoveryCallbacks = [];
    }
}
```

**Testing:**

- Create 100 instances, destroy them, verify listeners are removed
- Use `getEventListeners(canvas)` in Chrome DevTools to confirm

---

## 🟠 Week 2: High Priority Issues (Fix Next)

**Estimated Time:** 16-20 hours **Impact:** Prevents 20-50MB leaks and improves
cleanup reliability

### Priority 1 - High Priority Leaks

#### 8. ElementTargetingAnimations - RAF Not Cancelled (3-4 hours)

**Files:** `src/core/positioning/elementTargeting/ElementTargetingAnimations.js`
**Issue:** RAF loops created without tracking IDs, only callbacks stored

**Fix:**

```javascript
class ElementTargetingAnimations {
    constructor(positionController) {
        this.positionController = positionController;
        this.activeAnimations = new Map(); // Stores callbacks
        this.activeRAFIds = new Set(); // NEW: Track RAF IDs
    }

    moveToElementWithBounce(element, options = {}) {
        // ... existing setup code ...

        const animate = currentTime => {
            // ... existing animation logic ...

            if (progress < 1) {
                const rafId = requestAnimationFrame(animate);
                this.activeRAFIds.add(rafId); // Track RAF ID
                this.activeAnimations.set(animationId, { animate, rafId });
            } else {
                this.activeAnimations.delete(animationId);
                if (onComplete) onComplete();
            }
        };

        const rafId = requestAnimationFrame(animate);
        this.activeRAFIds.add(rafId);
        this.activeAnimations.set(animationId, { animate, rafId });
    }

    stopAllAnimations() {
        // Cancel all RAF loops
        this.activeRAFIds.forEach(id => cancelAnimationFrame(id));
        this.activeRAFIds.clear();

        // Clear animations
        this.activeAnimations.clear();
        this.animationQueue = [];
        this.isAnimating = false;
    }

    destroy() {
        this.stopAllAnimations();
        this.positionController = null;
    }
}
```

**Testing:**

- Start 10 animations, call destroy() immediately, verify RAF cancelled
- Check with Performance Monitor that no animation frames continue

---

#### 9. Animation Classes Missing destroy() (4-6 hours)

**Files:**

- `src/mascot/animation/OrbScaleAnimator.js`
- `src/core/animation/RotationBrake.js`
- `src/core/renderer/GestureAnimator.js`

**Issue:** No destroy methods, hold renderer references and callbacks

**Fix for each file:**

```javascript
// OrbScaleAnimator.js
class OrbScaleAnimator {
    constructor(mascot) {
        this.mascot = mascot;
        this.animationId = null; // Track RAF
    }

    startScaleAnimation(targetScale, duration, easing) {
        // Cancel previous animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        const animate = () => {
            // ... existing animation logic ...

            if (progress < 1 && this.mascot.isRunning) {
                this.animationId = requestAnimationFrame(animate);
            }
        };

        this.animationId = requestAnimationFrame(animate);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.mascot = null;
    }
}

// Similar pattern for RotationBrake and GestureAnimator
```

**Testing:**

- Create animator, start animation, destroy, verify RAF cancelled
- Verify renderer references are nulled

---

#### 10. Texture Loading Callbacks Cleanup (3-4 hours)

**Files:**

- `src/3d/geometries/Moon.js:196-229`
- `src/3d/geometries/Sun.js:75-96`

**Issue:** Async texture loading without abort mechanism or disposal

**Fix:**

```javascript
class GeometryHelper {
    constructor() {
        this.pendingTextures = new Map(); // Track in-flight loads
    }

    async loadTextureWithCleanup(url, textureLoader, onLoad, onError) {
        const abortController = new AbortController();
        const textureId = Symbol('texture');

        this.pendingTextures.set(textureId, abortController);

        try {
            const texture = await textureLoader.loadAsync(url);

            // Check if aborted
            if (abortController.signal.aborted) {
                texture.dispose();
                return null;
            }

            this.pendingTextures.delete(textureId);
            if (onLoad) onLoad(texture);
            return texture;
        } catch (error) {
            this.pendingTextures.delete(textureId);
            if (onError) onError(error);
            return null;
        }
    }

    destroy() {
        // Abort all pending texture loads
        this.pendingTextures.forEach(controller => controller.abort());
        this.pendingTextures.clear();
    }
}
```

**Testing:**

- Start 10 texture loads, call destroy() immediately
- Verify textures are disposed if load completes after destroy

---

## 🟡 Week 3: Medium Priority Issues (Improve Stability)

**Estimated Time:** 12-16 hours **Impact:** Improves memory efficiency and
prevents edge case leaks

### Priority 2 - Medium Priority Issues

#### 11. Unbounded Caches - Add Size Limits (4-6 hours)

**Files:**

- `src/core/audio/SoundSystem.js:68` (warningTimestamps)
- `src/core/audio/MusicalDuration.js:38` (cache)
- `src/core/Particle.js:115` (cachedColors per particle)

**Fix pattern:**

```javascript
// Add LRU eviction to unbounded caches
class SoundSystem {
    constructor() {
        this.warningTimestamps = new Map(); // Change to Map for LRU
        this.maxWarningKeys = 50; // Limit
    }

    throttledWarn(message, key) {
        const now = Date.now();

        // Evict oldest if at capacity
        if (this.warningTimestamps.size >= this.maxWarningKeys) {
            const firstKey = this.warningTimestamps.keys().next().value;
            this.warningTimestamps.delete(firstKey);
        }

        const lastWarning = this.warningTimestamps.get(key) || 0;
        if (now - lastWarning > this.warningThrottle) {
            this.warningTimestamps.set(key, now);
            console.warn(message);
        }
    }
}
```

**Testing:**

- Generate 100 unique warning keys
- Verify map size stays at 50
- Check oldest entries are evicted first

---

#### 12. Canvas Context Cleanup Enhancement (2-3 hours)

**Files:**

- `src/core/canvas/CanvasManager.js`
- `src/core/EmotiveRenderer.js`
- `src/core/renderer/GlowRenderer.js`

**Fix:**

```javascript
// Standard canvas cleanup pattern
destroyCanvas(canvas, context) {
    if (context) {
        // Clear any pending renders
        context.clearRect(0, 0, canvas.width, canvas.height);
        context = null;
    }
    if (canvas) {
        // Reset dimensions to free memory
        canvas.width = 0;
        canvas.height = 0;
        canvas = null;
    }
}

// Apply to all canvas cleanup in destroy() methods
```

**Testing:**

- Create/destroy 100 renderers
- Verify memory returns to baseline
- Check with Chrome DevTools heap snapshots

---

#### 13. Queue Timeout Tracking (2-3 hours)

**Files:**
`src/core/positioning/elementTargeting/ElementTargetingAnimations.js:336-353`

**Fix:**

```javascript
class ElementTargetingAnimations {
    constructor() {
        // ... existing code ...
        this.queueTimeouts = new Set(); // Track queue timeouts
    }

    processAnimationQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;

        this.isAnimating = true;
        const animation = this.animationQueue.shift();

        if (animation) {
            const cleanup = this.executeAnimation(animation);
            if (cleanup) {
                const timeoutId = setTimeout(() => {
                    this.queueTimeouts.delete(timeoutId);
                    cleanup();
                    this.isAnimating = false;
                    this.processAnimationQueue();
                }, animation.duration || 1000);

                this.queueTimeouts.add(timeoutId);
            }
        }
    }

    destroy() {
        this.stopAllAnimations();

        // Clear queue timeouts
        this.queueTimeouts.forEach(id => clearTimeout(id));
        this.queueTimeouts.clear();

        this.positionController = null;
    }
}
```

---

## Testing Strategy

### Automated Tests

```javascript
// test/memory/memory-leaks.test.js
describe('Memory Leak Fixes', () => {
    describe('GestureScheduler', () => {
        it('should clear all timers on destroy', () => {
            const scheduler = new GestureScheduler();
            scheduler.startProcessing();

            // Queue some gestures
            scheduler.queueGesture('bounce', 0, 100);
            scheduler.queueGesture('pulse', 0, 200);

            scheduler.destroy();

            // Verify no timers remain
            expect(scheduler.processInterval).toBeNull();
            expect(scheduler.pendingTimeouts.size).toBe(0);
        });
    });

    describe('TimelineRecorder', () => {
        it('should clear all timeouts on stopPlayback', () => {
            const recorder = new TimelineRecorder(
                getEngine,
                audioManager,
                state
            );
            const timeline = [
                { type: 'gesture', name: 'bounce', time: 100 },
                { type: 'gesture', name: 'pulse', time: 200 },
            ];

            recorder.playTimeline(timeline);
            expect(recorder._activeTimeouts.size).toBeGreaterThan(0);

            recorder.stopPlayback();
            expect(recorder._activeTimeouts.size).toBe(0);
        });
    });

    describe('PMREMGenerator', () => {
        it('should dispose render targets', () => {
            const renderer = new ThreeRenderer(canvas);

            // Track initial GPU memory
            const initialInfo = renderer.renderer.info.memory;

            renderer.createEnvironmentMap();
            renderer.destroy();

            // Verify resources disposed
            expect(renderer._envCubeRenderTarget).toBeNull();
            expect(renderer._envScene).toBeNull();
        });
    });
});
```

### Manual Testing Checklist

- [ ] Create 1000 gestures → destroy → memory returns to baseline
- [ ] Play 100 timelines → stop all → no timers remain
- [ ] Load/unload environment maps 10x → GPU memory stable
- [ ] Run 8-hour stress test → memory plateaus, no continuous growth
- [ ] Test on mobile with low memory → context loss handled gracefully
- [ ] Profile allocation rate before/after Map recreation fixes

---

## Rollout Plan

### Phase 1: Week 1 (Critical Fixes)

1. Deploy GestureScheduler fix
2. Deploy TimelineRecorder fix
3. Deploy PMREMGenerator fix
4. Deploy cache recreation fixes
5. Deploy context loss handlers
6. Deploy CanvasContextRecovery fix

**Success Criteria:**

- Memory growth <10MB over 8 hours
- No timer leaks detected
- Mobile context loss handled gracefully

### Phase 2: Week 2 (High Priority)

1. Deploy animation RAF tracking
2. Deploy destroy() methods to animators
3. Deploy texture loading cleanup

**Success Criteria:**

- No RAF loops continue after destroy()
- All animators properly release resources

### Phase 3: Week 3 (Medium Priority)

1. Deploy cache size limits
2. Deploy canvas cleanup enhancements
3. Deploy queue timeout tracking

**Success Criteria:**

- All caches bounded and stable
- Canvas memory freed immediately on destroy

---

## Monitoring

Add to `HealthCheck` system:

```javascript
getMemoryLeakMetrics() {
    return {
        gestureScheduler: {
            activeTimeouts: scheduler.pendingTimeouts.size,
            processIntervalActive: !!scheduler.processInterval
        },
        timelineRecorder: {
            activeTimeouts: recorder._activeTimeouts.size,
            isPlaying: recorder._state.isPlaying
        },
        caches: {
            gradientCacheSize: gradientCache.cache.size,
            gestureSoundLibraryStatic: true, // Should be true after fix
            emotionalModifiersStatic: true    // Should be true after fix
        },
        webgl: {
            contextLost: renderer._contextLost,
            gpuMemoryTextures: renderer.renderer.info.memory.textures,
            gpuMemoryGeometries: renderer.renderer.info.memory.geometries
        }
    };
}
```

---

## Success Metrics

**Before Fixes:**

- Memory growth: 50-200MB over 8 hours
- Timers: 100+ orphaned per hour
- GPU leaks: 20-50MB
- Context loss: Application freeze

**After Fixes:**

- Memory growth: <10MB over 8 hours (80-95% improvement)
- Timers: 0 orphaned
- GPU leaks: <2MB
- Context loss: Graceful recovery

---

## Estimated Total Impact

**Memory Saved:** 40-190MB over 8-hour session **CPU Saved:** Elimination of
60fps interval when idle **Stability:** Mobile context loss recovery prevents
crashes **Developer Experience:** Proper cleanup enables hot-reload scenarios

**Total Development Time:** 40-60 hours across 3 weeks **Expected ROI:**
Immediate improvement in production stability and performance
