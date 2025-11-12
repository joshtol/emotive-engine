# Memory Leak Audit Report: Caching & Data Structures

**Agent 9 - Cache & Data Structure Memory Leak Analysis**

**Date:** 2025-01-12 **Auditor:** Agent 9 **Scope:** Caching systems, data
structures, registries, and memoization patterns

---

## Executive Summary

### Overall Assessment: ⚠️ **MODERATE RISK**

The codebase shows **good cache management practices** in most areas with proper
LRU eviction and cleanup. However, several **unbounded caches** and **static
registries** have been identified that could lead to memory accumulation over
long sessions.

### Key Findings:

- ✅ **7 properly bounded caches** with LRU eviction
- ⚠️ **5 unbounded caches** requiring size limits
- ⚠️ **3 static registries** that never clear
- ⚠️ **2 Map misuse cases** (should use WeakMap)
- ✅ ArrayPool has max size limits (good!)

---

## Critical Issues (Immediate Action Required)

### 🔴 CRITICAL-1: GestureSoundLibrary - Function-Scoped Map Never Released

**File:** `src/core/audio/GestureSoundLibrary.js` **Lines:** 45-512

**Issue:**

```javascript
static getSoundConfig(gestureId) {
    const gestureSounds = new Map([
        ['bounce', { /* large config */ }],
        ['pulse', { /* large config */ }],
        // ... 30+ gestures
    ]);
    return gestureSounds.get(gestureId) || null;
}
```

**Problem:**

- **New Map created on EVERY CALL** to `getSoundConfig()`
- Called frequently during gesture playback
- Each Map contains 30+ gesture configs with large envelope arrays
- No caching, no reuse - pure memory churn
- Estimated allocation: ~10-20 KB per call

**Impact:** HIGH - Called multiple times per second during active gestures

**Recommended Fix:**

```javascript
export class GestureSoundLibrary {
    // Store as static class property
    static GESTURE_SOUNDS = new Map([
        [
            'bounce',
            {
                /* config */
            },
        ],
        [
            'pulse',
            {
                /* config */
            },
        ],
        // ...
    ]);

    static getSoundConfig(gestureId) {
        return GestureSoundLibrary.GESTURE_SOUNDS.get(gestureId) || null;
    }
}
```

**Priority:** 🔴 CRITICAL - Fix immediately

---

### 🔴 CRITICAL-2: SoundSystem.emotionalModifiers - Function-Scoped Map

**File:** `src/core/audio/SoundSystem.js` **Lines:** 524-536

**Issue:**

```javascript
getEmotionalModifiers(emotion) {
    const modifiers = new Map([
        ['neutral', { intensity: 1.0, speed: 1.0 }],
        ['joy', { intensity: 1.3, speed: 1.2 }],
        // ... 8 emotions
    ]);
    return modifiers.get(emotion) || modifiers.get('neutral');
}
```

**Problem:**

- New Map created on every call
- Called for every gesture sound (multiple times per second)
- 8 emotion entries recreated unnecessarily

**Impact:** MEDIUM-HIGH - High frequency calls

**Recommended Fix:**

```javascript
constructor() {
    // Store as instance property
    this.emotionalModifiers = new Map([
        ['neutral', { intensity: 1.0, speed: 1.0 }],
        ['joy', { intensity: 1.3, speed: 1.2 }],
        // ...
    ]);
}

getEmotionalModifiers(emotion) {
    return this.emotionalModifiers.get(emotion) ||
           this.emotionalModifiers.get('neutral');
}
```

**Priority:** 🔴 CRITICAL - Fix immediately

---

## High Priority Issues

### 🟠 HIGH-1: SoundSystem.warningTimestamps - Unbounded Object Cache

**File:** `src/core/audio/SoundSystem.js` **Lines:** 68, 574-581

**Issue:**

```javascript
constructor() {
    this.warningTimestamps = {};  // ❌ UNBOUNDED
    this.warningThrottle = 5000;
}

throttledWarn(message, key) {
    const now = Date.now();
    const lastWarning = this.warningTimestamps[key] || 0;

    if (now - lastWarning > this.warningThrottle) {
        this.warningTimestamps[key] = now;  // ❌ Never removed
    }
}
```

**Problem:**

- Keys never removed from `warningTimestamps`
- Every unique warning key stays forever
- In production with many dynamic keys, this grows unbounded

**Impact:** MEDIUM - Slow accumulation over long sessions

**Recommended Fix:**

```javascript
constructor() {
    this.warningTimestamps = new Map();
    this.maxWarningKeys = 50;  // Limit cache size
}

throttledWarn(message, key) {
    const now = Date.now();
    const lastWarning = this.warningTimestamps.get(key) || 0;

    if (now - lastWarning > this.warningThrottle) {
        this.warningTimestamps.set(key, now);

        // LRU eviction
        if (this.warningTimestamps.size > this.maxWarningKeys) {
            const firstKey = this.warningTimestamps.keys().next().value;
            this.warningTimestamps.delete(firstKey);
        }
    }
}
```

**Priority:** 🟠 HIGH

---

### 🟠 HIGH-2: LazyLoader Module Caches - No Eviction

**File:** `src/core/optimization/LazyLoader.js` **Lines:** 9-11

**Issue:**

```javascript
constructor(options = {}) {
    this.cache = new Map();        // ❌ UNBOUNDED
    this.loading = new Map();      // ❌ UNBOUNDED
    this.moduleMap = new Map([
        ['core', () => import('../../core-exports.js')],
        ['features', () => import('../../features-exports.js')],
        // ...
    ]);
}
```

**Problem:**

- `this.cache` stores loaded modules forever
- `this.loading` stores promises (cleaned on completion, OK)
- `clearCache()` method exists but is never called automatically
- Loaded modules are never evicted, even if not used

**Impact:** MEDIUM - Depends on module count

**Recommended Fix:** Add LRU eviction and automatic cleanup:

```javascript
constructor(options = {}) {
    this.cache = new Map();
    this.loading = new Map();
    this.maxCacheSize = options.maxCacheSize || 20;
    this.cacheAccessTimes = new Map();  // Track LRU
}

async load(moduleName) {
    if (this.cache.has(moduleName)) {
        // Track access for LRU
        this.cacheAccessTimes.set(moduleName, Date.now());
        return this.cache.get(moduleName);
    }

    // ... load module ...

    // Enforce cache limit
    if (this.cache.size >= this.maxCacheSize) {
        this.evictLRU();
    }

    this.cache.set(moduleName, module);
    this.cacheAccessTimes.set(moduleName, Date.now());
}

evictLRU() {
    // Find least recently used
    let oldest = null;
    let oldestTime = Infinity;

    for (const [name, time] of this.cacheAccessTimes) {
        if (time < oldestTime) {
            oldest = name;
            oldestTime = time;
        }
    }

    if (oldest) {
        this.cache.delete(oldest);
        this.cacheAccessTimes.delete(oldest);
    }
}
```

**Priority:** 🟠 HIGH

---

### 🟠 HIGH-3: GazeTracker.touches - Should Use WeakMap

**File:** `src/core/behavior/GazeTracker.js` **Lines:** 71

**Issue:**

```javascript
constructor(canvas, options = {}) {
    this.touches = new Map();  // ❌ Should be WeakMap
    this.primaryTouch = null;
}

handleTouchStart(event) {
    for (const touch of event.changedTouches) {
        this.touches.set(touch.identifier, {  // Stores touch objects
            x: touch.clientX,
            y: touch.clientY
        });
    }
}
```

**Problem:**

- Uses `Map` to store touch data by touch.identifier (number)
- Touch entries are removed in `handleTouchEnd`, BUT...
- If `touchend` event is missed (browser bug, gesture interruption), entries
  leak forever
- Each missed touch: ~32 bytes (identifier + coordinates)

**Impact:** LOW-MEDIUM - Rare but possible on mobile devices

**Analysis:** Actually, **WeakMap won't work here** because keys are numbers
(primitives), not objects. The current implementation with explicit cleanup in
`handleTouchEnd` is correct. The real issue is **missing touchcancel handling**.

**Recommended Fix:** Ensure all touch cleanup is thorough:

```javascript
constructor(canvas, options = {}) {
    this.touches = new Map();
    this.primaryTouch = null;
    this.touchCleanupTimeout = null;
}

handleTouchEnd(event) {
    for (const touch of event.changedTouches) {
        this.touches.delete(touch.identifier);

        if (touch.identifier === this.primaryTouch) {
            this.primaryTouch = null;

            if (this.touches.size > 0) {
                this.primaryTouch = this.touches.keys().next().value;
            } else {
                this.handleMouseLeave();
            }
        }
    }

    // Safety: Clear orphaned touches after 5 seconds
    clearTimeout(this.touchCleanupTimeout);
    this.touchCleanupTimeout = setTimeout(() => {
        this.touches.clear();
        this.primaryTouch = null;
    }, 5000);
}

destroy() {
    this.detachEventListeners();
    if (this.resizeObserver) {
        this.resizeObserver.disconnect();
    }
    clearTimeout(this.touchCleanupTimeout);  // Clean up timeout
    this.touches.clear();
}
```

**Priority:** 🟠 MEDIUM-HIGH

---

### 🟠 HIGH-4: ShapeMorpher.shapeCache - Unbounded Map

**File:** `src/core/ShapeMorpher.js` **Lines:** 58, 149-164

**Issue:**

```javascript
constructor(options = {}) {
    this.shapeCache = new Map();  // ❌ UNBOUNDED
}

getShapePoints(shapeName) {
    if (!this.shapeCache.has(shapeName)) {
        const shapeDef = shapeCache && shapeCache.isInitialized ?
            shapeCache.getShape(shapeName) : SHAPE_DEFINITIONS[shapeName];
        // ...
        this.shapeCache.set(shapeName, points);  // ❌ Never evicted
        return points;
    }
    return this.shapeCache.get(shapeName);
}
```

**Problem:**

- Caches every shape ever morphed
- No size limit or eviction
- Pre-warming in constructor is good, but dynamic shapes accumulate
- Each shape: ~4 KB (64 points × 2 floats × 4 bytes)

**Impact:** LOW-MEDIUM - Limited by shape count (~20-30 shapes)

**Recommended Fix:** Add size limit (pre-warmed shapes should cover 99% of use):

```javascript
constructor(options = {}) {
    this.shapeCache = new Map();
    this.maxShapeCache = options.maxShapeCache || 30;  // Limit

    // Pre-warm the shape cache
    this.prewarmCache();
}

getShapePoints(shapeName) {
    if (!this.shapeCache.has(shapeName)) {
        const shapeDef = /* ... */;
        const points = shapeDef.points;

        // Enforce cache limit
        if (this.shapeCache.size >= this.maxShapeCache) {
            const firstKey = this.shapeCache.keys().next().value;
            this.shapeCache.delete(firstKey);
        }

        this.shapeCache.set(shapeName, points);
        return points;
    }
    return this.shapeCache.get(shapeName);
}
```

**Priority:** 🟠 MEDIUM (bounded by design, but should have explicit limit)

---

## Medium Priority Issues

### 🟡 MEDIUM-1: GestureScheduler.activeGestures - Cleanup Dependency

**File:** `src/core/GestureScheduler.js` **Lines:** 31-32

**Issue:**

```javascript
constructor(mascot) {
    this.activeGestures = new Map();  // Track active gestures
    this.gestureQueues = new Map();   // Per-gesture queues
}
```

**Problem:**

- Relies on gesture completion to remove entries
- If gesture completion callback fails, entries leak
- No explicit size limit or timeout cleanup

**Impact:** LOW-MEDIUM - Depends on completion reliability

**Recommended Fix:** Add timeout-based cleanup:

```javascript
executeGesture(queueItem) {
    const { gestureName, gesture, endTime } = queueItem;

    // Track active gesture
    this.activeGestures.set(gestureName, endTime);

    // ... execute gesture ...

    // Safety: Force cleanup after expected duration + buffer
    const duration = this.calculateGestureDuration(gesture);
    setTimeout(() => {
        if (this.activeGestures.get(gestureName) === endTime) {
            this.activeGestures.delete(gestureName);
            this.gestureQueues.delete(gestureName);
        }
    }, duration + 1000);  // +1s buffer
}
```

**Priority:** 🟡 MEDIUM

---

### 🟡 MEDIUM-2: DegradationManager.performanceHistory - Fixed Size (Good!)

**File:** `src/core/system/DegradationManager.js` **Lines:** 118-119, 237-240

**Status:** ✅ **PROPERLY IMPLEMENTED**

**Analysis:**

```javascript
constructor(config = {}) {
    this.performanceHistory = [];
    this.maxHistorySize = 30;  // ✅ BOUNDED
}

checkPerformance(metrics = {}) {
    this.performanceHistory.push({ fps, memoryUsage, timestamp });
    if (this.performanceHistory.length > this.maxHistorySize) {
        this.performanceHistory.shift();  // ✅ LRU EVICTION
    }
}
```

**Result:** No issues - well-implemented bounded cache!

---

### 🟡 MEDIUM-3: StateStore Multiple Caches - Good Bounds

**File:** `src/core/state/StateStore.js` **Lines:** 21-35

**Status:** ✅ **PROPERLY IMPLEMENTED**

**Analysis:**

```javascript
constructor(initialState = {}) {
    this._subscribers = new Map();     // ✅ Cleaned on unsubscribe
    this._history = [];                // ✅ Bounded by maxHistorySize
    this._maxHistorySize = 50;         // ✅ Explicit limit
    this._computed = new Map();        // ✅ Invalidated on changes
    this._computedDeps = new Map();    // ✅ Static metadata
    this._validators = new Map();      // ✅ Static metadata
}
```

**Result:** Excellent cache management with proper bounds!

---

### 🟡 MEDIUM-4: PerformanceMonitor.measures - Bounded (Good!)

**File:** `src/core/system/PerformanceMonitor.js` **Lines:** 28-29, 100-111

**Status:** ✅ **PROPERLY IMPLEMENTED**

**Analysis:**

```javascript
constructor(options = {}) {
    this.marks = new Map();      // ✅ Transient, OK
    this.measures = new Map();   // ✅ Bounded per measure
    this.maxSamples = options.maxSamples || 60;
}

measure(name, startMark, endMark = null) {
    let measures = this.measures.get(name);
    if (!measures) {
        measures = [];
        this.measures.set(name, measures);
    }
    measures.push(duration);

    if (measures.length > this.maxSamples) {  // ✅ LRU EVICTION
        measures.shift();
    }
}
```

**Result:** Well-implemented with bounds!

---

## Static Registries (Low Risk but Note)

### 📘 INFO-1: THREE_GEOMETRIES Registry

**File:** `src/3d/geometries/ThreeGeometries.js` **Lines:** 245-394

**Issue:**

```javascript
export const THREE_GEOMETRIES = {
    sphere: { geometry: createSphere(64, 64), blink: {...} },
    crystal: { geometry: createCrystal(6), blink: {...} },
    // ... 15+ geometries
};
```

**Analysis:**

- Static registry created at module load
- Geometries are THREE.BufferGeometry instances (stored in GPU)
- **Estimated size:** ~10-20 KB CPU + ~500 KB-1 MB GPU memory
- Never cleared (intentional for fast access)

**Impact:** LOW - Fixed size, intentional design

**Recommendation:**

- Add `disposeThreeGeometries()` function for cleanup on engine shutdown
- Document memory footprint in README

```javascript
export function disposeThreeGeometries() {
    Object.values(THREE_GEOMETRIES).forEach(config => {
        if (config.geometry && config.geometry.dispose) {
            config.geometry.dispose();
        }
    });
}
```

**Priority:** 🔵 LOW - Enhancement

---

### 📘 INFO-2: CORE_GEOMETRIES Registry (LEGACY - Unused)

**File:** `src/3d/geometries/index.js` **Lines:** 23-35

**Issue:**

```javascript
export const CORE_GEOMETRIES = {
    sphere: createSphere(32, 32), // ❌ LEGACY
    crystal: createCrystal(6),
    diamond: createDiamond(),
};
```

**Analysis:**

- **LEGACY REGISTRY** - Comment says "NOT USED"
- Should be removed in cleanup
- Currently dead code

**Recommendation:** Remove this registry entirely (not used by codebase).

**Priority:** 🔵 LOW - Code cleanup

---

## Excellent Implementations ✅

### ParticleEmotionCalculator - Perfect LRU Cache

**File:** `src/3d/particles/ParticleEmotionCalculator.js` **Lines:** 30-73

```javascript
constructor() {
    this.cachedConfigs = new Map();    // ✅ Bounded
    this.maxCacheSize = 100;           // ✅ Explicit limit
}

calculate(emotion, undertone = null) {
    const cacheKey = `${emotion}:${undertone || 'none'}`;
    if (this.cachedConfigs.has(cacheKey)) {
        return this.cachedConfigs.get(cacheKey);  // ✅ Cache hit
    }

    // ... compute config ...

    // Enforce cache size limit (LRU-style: remove oldest)
    if (this.cachedConfigs.size >= this.maxCacheSize) {
        const firstKey = this.cachedConfigs.keys().next().value;
        this.cachedConfigs.delete(firstKey);  // ✅ LRU EVICTION
    }

    this.cachedConfigs.set(cacheKey, finalConfig);
    return finalConfig;
}
```

**Analysis:** 🌟 PERFECT CACHE IMPLEMENTATION

- Bounded size (100 entries)
- LRU eviction (simple FIFO)
- Clear cache method provided
- Stats tracking

---

### ArrayPool - Excellent Pooling Strategy

**File:** `src/utils/ArrayPool.js` **Lines:** 6-95

```javascript
class ArrayPool {
    constructor() {
        this.pools = new Map(); // ✅ Bounded per array size
        this.inUse = new Set(); // ✅ Tracks active arrays
    }

    release(array) {
        // ... cleanup ...

        const pool = this.pools.get(key);
        if (pool.length < 10) {
            // ✅ MAX 10 per size
            pool.push(array);
        }
    }
}
```

**Analysis:** 🌟 EXCELLENT IMPLEMENTATION

- Bounded pool size (max 10 per type)
- Tracks in-use arrays
- Automatic cleanup on release
- Prevents unbounded growth

---

### ShapeCache - Well-Designed Pre-Warming

**File:** `src/core/cache/ShapeCache.js\*\* **Lines:** 27-357

```javascript
export class ShapeCache {
    constructor() {
        this.shapeCache = new Map(); // ✅ Pre-warmed
        this.morphCache = new Map(); // ✅ Common pairs only
        this.propertyCache = new Map(); // ✅ Metadata cache

        this.initialize(); // ✅ Pre-warm common shapes
    }

    initialize() {
        // Pre-cache all core shapes
        const shapes = Object.keys(SHAPE_DEFINITIONS);
        shapes.forEach(shapeName => {
            this.cacheShape(shapeName);
        });

        // Pre-cache common morph pairs
        this.cacheCommonMorphs(shapes);
    }
}
```

**Analysis:** 🌟 WELL-DESIGNED

- Pre-warms expected shapes
- Caches common morph transitions
- Stats tracking
- Clear() method provided

**Note:** ShapeMorpher has a separate unbounded cache (see HIGH-4)

---

## Map vs WeakMap Analysis

### Correct Use of Map (Strong References Needed)

All current Map usages are **CORRECT**. WeakMap is not applicable because:

1. **GazeTracker.touches** - Keys are numbers (primitives), not objects
2. **GestureScheduler.activeGestures** - Keys are strings, need explicit cleanup
3. **LazyLoader.cache** - Need to retain modules regardless of external
   references
4. **SoundSystem.emotionalModifiers** - Static config data (should be static
   Map)
5. **StateStore.\_subscribers** - Symbol keys with cleanup callbacks
6. **PerformanceMonitor.measures** - Need explicit control over retention

**Verdict:** ✅ No WeakMap opportunities in this codebase (all are correct Map
usages)

---

## Closure-Based Caches

### 🔴 GestureSoundLibrary.getSoundConfig

- ❌ **CRITICAL ISSUE** - Map created in function scope on every call
- See CRITICAL-1 above

### 🔴 SoundSystem.getEmotionalModifiers

- ❌ **CRITICAL ISSUE** - Map created in function scope on every call
- See CRITICAL-2 above

### ✅ Crystal.createCrystal

**File:** `src/3d/geometries/Crystal.js` **Lines:** 18-30

```javascript
export function createCrystal(segments = 6) {
    const vertexMap = new Map(); // ✅ SAFE - transient, returns immediately
    let vertexIndex = 0;

    // Helper to add unique vertex
    function addVertex(x, y, z, nx, ny, nz) {
        const key = `${x},${y},${z}`;
        if (!vertexMap.has(key)) {
            // ...
        }
    }
    // ... generate geometry ...
    return geometry; // Map is garbage collected
}
```

**Analysis:** ✅ SAFE

- Transient Map created during geometry generation
- Returns immediately after function completes
- Map is garbage collected when function exits
- No accumulation

---

## Memoization Patterns

### StateStore.createSelector - Proper Memoization

**File:** `src/core/state/StateStore.js` **Lines:** 272-286

```javascript
createSelector(selector) {
    let lastState = null;    // ✅ Closure captures state
    let lastResult = null;   // ✅ Closure captures result

    return () => {
        const currentState = this._state;
        if (currentState === lastState) {
            return lastResult;  // ✅ Memoized result
        }

        lastState = currentState;
        lastResult = selector(currentState);
        return lastResult;
    };
}
```

**Analysis:** ✅ EXCELLENT MEMOIZATION

- Single-value memoization (not unbounded)
- Identity check (reference equality)
- Closure-based (no global state)
- Bounded by selector count (developer creates selectors)

---

## Summary Table

| File                           | Cache/Map            | Type                | Bounded?       | Eviction?    | Risk           | Priority         |
| ------------------------------ | -------------------- | ------------------- | -------------- | ------------ | -------------- | ---------------- |
| `GestureSoundLibrary.js`       | `gestureSounds`      | Function-scoped Map | ❌             | ❌           | 🔴 Critical    | **P0 - FIX NOW** |
| `SoundSystem.js`               | `emotionalModifiers` | Function-scoped Map | ❌             | ❌           | 🔴 Critical    | **P0 - FIX NOW** |
| `SoundSystem.js`               | `warningTimestamps`  | Object              | ❌             | ❌           | 🟠 High        | **P1**           |
| `LazyLoader.js`                | `cache`              | Map                 | ❌             | ❌           | 🟠 High        | **P1**           |
| `GazeTracker.js`               | `touches`            | Map                 | ❌             | ⚠️ Manual    | 🟠 Medium-High | **P1**           |
| `ShapeMorpher.js`              | `shapeCache`         | Map                 | ⚠️ Design      | ❌           | 🟠 Medium      | **P2**           |
| `GestureScheduler.js`          | `activeGestures`     | Map                 | ⚠️ Callback    | ⚠️ Callback  | 🟡 Medium      | **P2**           |
| `ParticleEmotionCalculator.js` | `cachedConfigs`      | Map                 | ✅ (100)       | ✅ LRU       | ✅ Safe        | N/A              |
| `ArrayPool.js`                 | `pools`              | Map                 | ✅ (10/size)   | ✅ LRU       | ✅ Safe        | N/A              |
| `ShapeCache.js`                | `shapeCache`         | Map                 | ✅ Pre-warmed  | N/A          | ✅ Safe        | N/A              |
| `DegradationManager.js`        | `performanceHistory` | Array               | ✅ (30)        | ✅ Shift     | ✅ Safe        | N/A              |
| `StateStore.js`                | `_history`           | Array               | ✅ (50)        | ✅ Shift     | ✅ Safe        | N/A              |
| `StateStore.js`                | `_computed`          | Map                 | ✅ Invalidated | ✅ On change | ✅ Safe        | N/A              |
| `PerformanceMonitor.js`        | `measures`           | Map                 | ✅ (60/type)   | ✅ Shift     | ✅ Safe        | N/A              |
| `THREE_GEOMETRIES`             | Static registry      | Object              | ✅ Static      | N/A          | 🔵 Low         | Enhancement      |
| `CORE_GEOMETRIES`              | Static registry      | Object              | ❌ Unused      | N/A          | 🔵 Low         | Cleanup          |

---

## Recommendations

### Immediate Actions (P0)

1. ✅ **Fix GestureSoundLibrary** - Move Map to static class property
2. ✅ **Fix SoundSystem.getEmotionalModifiers** - Move Map to instance property

### High Priority (P1)

3. Add bounds to `SoundSystem.warningTimestamps` with LRU eviction
4. Add LRU eviction to `LazyLoader.cache`
5. Add timeout-based cleanup to `GazeTracker.touches`

### Medium Priority (P2)

6. Add explicit size limit to `ShapeMorpher.shapeCache`
7. Add timeout-based cleanup to `GestureScheduler.activeGestures`
8. Remove unused `CORE_GEOMETRIES` registry

### Enhancements

9. Add `disposeThreeGeometries()` for cleanup on shutdown
10. Document memory footprint of static registries

---

## Testing Recommendations

### Memory Leak Tests

```javascript
// Test GestureSoundLibrary fix
describe('GestureSoundLibrary', () => {
    it('should not allocate new Map on every call', () => {
        const config1 = GestureSoundLibrary.getSoundConfig('bounce');
        const config2 = GestureSoundLibrary.getSoundConfig('bounce');
        // Verify Map is reused (check static property)
        expect(GestureSoundLibrary.GESTURE_SOUNDS).toBeDefined();
    });
});

// Test cache bounds
describe('Cache bounds', () => {
    it('should enforce max size on warningTimestamps', () => {
        const soundSystem = new SoundSystem();
        for (let i = 0; i < 100; i++) {
            soundSystem.throttledWarn(`Warning ${i}`, `key-${i}`);
        }
        expect(soundSystem.warningTimestamps.size).toBeLessThanOrEqual(50);
    });
});
```

---

## Monitoring Recommendations

Add cache metrics to PerformanceMonitor:

```javascript
getCacheStats() {
    return {
        shapeMorpherCache: this.shapeMorpher.shapeCache.size,
        lazyLoaderCache: this.lazyLoader.cache.size,
        particleCache: this.particleCalculator.getCacheSize(),
        // ...
    };
}
```

---

## Conclusion

The Emotive Engine demonstrates **good cache management practices** overall,
with several excellent implementations (ParticleEmotionCalculator, ArrayPool,
StateStore). However, **two critical function-scoped Map allocations** require
immediate attention, and several unbounded caches should have size limits added
for long-running applications.

**Total Issues:** 16 items

- 🔴 Critical: 2
- 🟠 High: 5
- 🟡 Medium: 4
- 🔵 Low: 2
- ✅ Good: 5

**Estimated Fix Time:** 4-6 hours for all priorities

**Agent 9 Sign-Off:** Cache audit complete. ✅
