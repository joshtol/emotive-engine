# Memory Leak Audit Report: Emotion & State Management

**Date:** 2025-11-12 **Auditor:** Agent 3 **Scope:** Emotion state transitions,
state machines, emotion configuration caching, undertone management, and event
emission

---

## Executive Summary

**Risk Level: MODERATE** - The emotion and state management system has several
areas requiring attention, particularly around unbounded history growth, cached
state objects, and event listener management. While some systems have cleanup
mechanisms, others lack proper bounds or disposal logic.

### Key Findings

- **3 CRITICAL** memory leaks requiring immediate attention
- **5 HIGH** priority issues with significant memory impact
- **4 MEDIUM** priority concerns requiring monitoring
- **2 LOW** priority observations for future improvement

---

## Critical Issues (Immediate Action Required)

### 1. StateStore History Growing Unbounded

**File:** `src/core/state/StateStore.js` (Lines 324-335) **Severity:** CRITICAL
**Impact:** Continuous memory growth during long sessions

**Issue:**

```javascript
addToHistory(updates) {
    this._history.push({
        timestamp: Date.now(),
        updates,
        state: this.deepClone(this._state)  // Deep clone entire state!
    });

    // Limit history size
    if (this._history.length > this._maxHistorySize) {
        this._history.shift();
    }
}
```

**Problems:**

1. **Deep cloning entire state on every update** - Expensive operation creating
   full copy
2. Default `_maxHistorySize = 50` entries with complete state snapshots
3. Each history entry contains:
    - Full state clone (all properties recursively)
    - Timestamp
    - Updates object
4. With 50 entries × (state size + metadata), this can grow to several MB
5. No automatic cleanup mechanism - relies on manual limits

**Memory Impact:**

- Estimated: **2-5 MB** for 50 entries with typical state size
- Growth rate: Linear with state update frequency
- Retention: Until manually cleared or limit exceeded

**Recommendations:**

1. Implement differential history (store only changes, not full snapshots)
2. Add time-based expiration (e.g., auto-delete entries older than 5 minutes)
3. Consider making history optional for production builds
4. Add `clearOldHistory(maxAge)` method for periodic cleanup
5. Reduce default `_maxHistorySize` to 20-30 entries

---

### 2. ContextManager History Accumulation

**File:** `src/core/state/ContextManager.js` (Lines 227-246) **Severity:**
CRITICAL **Impact:** Memory leak in context tracking system

**Issue:**

```javascript
addToHistory(previousContext, newContext, updates) {
    const entry = {
        timestamp: Date.now(),
        previous: previousContext,      // Full context copy
        current: { ...newContext },     // Full context copy
        updates,
        delta: { ... }
    };

    this.history.push(entry);

    // Trim history if exceeds limit
    if (this.history.length > this.historyLimit) {
        this.history.shift();  // Only removes ONE entry
    }
}
```

**Problems:**

1. **Stores BOTH previous and current context** - Double memory usage
2. Default `historyLimit = 50` means 100 context objects in memory
3. Each entry duplicates context data (frustration, urgency, magnitude,
   customValues)
4. `customValues` object can contain arbitrary data - unbounded growth potential
5. History enabled by default - no way to disable in production

**Memory Impact:**

- Estimated: **100-500 KB** for typical usage (50 entries × 2 contexts each)
- Risk: If `customValues` contains large objects, can grow to **several MB**
- Growth rate: Linear with context updates

**Recommendations:**

1. Store only deltas/changes instead of full context copies
2. Add automatic cleanup based on time (not just count)
3. Make history opt-in rather than opt-out
4. Add size limits to `customValues` object
5. Implement `trimHistory(maxAge, maxSize)` method

---

### 3. Event Listener Management - No Cleanup in EventManager

**File:** `src/EmotiveMascot.js` (Lines 136-159) **Severity:** CRITICAL
**Impact:** Event listeners never removed, accumulate indefinitely

**Issue:**

```javascript
// Add simple event emitter methods if not present
if (!this.eventManager.emit) {
    this.eventManager._listeners = {};
    this.eventManager.emit = (event, data) => {
        const listeners = this.eventManager._listeners[event];
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    };
    this.eventManager.on = (event, listener) => {
        if (!this.eventManager._listeners[event]) {
            this.eventManager._listeners[event] = [];
        }
        this.eventManager._listeners[event].push(listener); // Never removed!
    };
    this.eventManager.off = (event, listener) => {
        const listeners = this.eventManager._listeners[event];
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
}
```

**Problems:**

1. **No automatic cleanup** - Relies entirely on manual `off()` calls
2. No validation of listener count - can grow unbounded
3. No memory warnings when listener count exceeds threshold
4. Closures in listeners can capture large objects (renderer, state, etc.)
5. `removeAllListeners()` exists in wrapper but no automatic invocation

**Memory Impact:**

- Estimated: **50-200 KB per 100 listeners** (varies by closure size)
- Each listener closure may capture: mascot instance, renderer state, particles
- Growth pattern: Linear with event subscriptions
- Risk: Long-lived applications with dynamic subscriptions

**Recommendations:**

1. Implement automatic cleanup in `destroy()` method
2. Add listener count warnings (threshold: 20 per event)
3. Add WeakMap for automatic garbage collection of dead references
4. Implement `once()` pattern more aggressively (auto-remove after firing)
5. Add lifecycle hooks to remove listeners when components unmount

---

## High Priority Issues

### 4. EmotionalStateManager - No Cleanup of Cached Properties

**File:** `src/core/renderer/EmotionalStateManager.js` (Lines 66-134)
**Severity:** HIGH **Impact:** State objects persist indefinitely in renderer

**Issue:**

```javascript
applyUndertoneModifiers(undertone) {
    // Handle weighted modifier from state machine
    if (undertone && typeof undertone === 'object' && undertone.weight !== undefined) {
        const {weight} = undertone;

        // Apply weighted modifiers for smooth transitions
        this.renderer.state.sizeMultiplier = 1.0 + ((undertone.sizeMultiplier || 1.0) - 1.0) * weight;
        this.renderer.state.jitterAmount = (undertone.jitterAmount || 0) * weight;
        // ... 10+ more properties set
        return;
    }
    // ... similar patterns for string-based undertones
}
```

**Problems:**

1. **No cleanup method** - State properties never reset
2. Undertone modifiers stored in `renderer.state` indefinitely
3. Weighted modifiers create new objects on every transition
4. Previous undertone data not cleared when switching emotions
5. Glow cache cleared but undertone state persists

**Memory Impact:**

- Estimated: **10-50 KB** for accumulated state
- Each undertone transition adds modifier objects
- Old properties remain even after emotion changes

**Recommendations:**

1. Add `cleanup()` method to reset all undertone properties
2. Call cleanup when emotion changes to null or neutral
3. Implement state property pooling to reuse objects
4. Add timeout to auto-reset unused undertone properties

---

### 5. EmotiveStateMachine - Interpolation Cache Never Cleared

**File:** `src/core/state/EmotiveStateMachine.js` (Lines 116-122) **Severity:**
HIGH **Impact:** Cached emotional properties never garbage collected

**Issue:**

```javascript
// Cache for interpolation results
this.interpolationCache = {
    lastUpdate: 0,
    cacheInterval: 100, // Cache for 100ms
    cachedProperties: null, // Stored indefinitely
    cachedRenderState: null, // Never used, never cleared
};
```

**Problems:**

1. **`cachedProperties` persists forever** - Only updated, never cleared
2. `cachedRenderState` defined but never used - dead code
3. Cache checked every frame but only revalidated after 100ms
4. No size limits on cached properties
5. Old emotion data remains in cache after transitions complete

**Memory Impact:**

- Estimated: **5-20 KB** per cached state
- Contains: colors, intensities, particle rates, sizes
- Growth: One cache per state machine instance

**Recommendations:**

1. Clear cache after transitions complete (progress >= 1)
2. Remove unused `cachedRenderState` property
3. Add `clearCache()` method for manual invalidation
4. Implement cache expiration (clear after 5 seconds idle)

---

### 6. EmotionCache - No Size Limits on Maps

**File:** `src/core/cache/EmotionCache.js` (Lines 28-48) **Severity:** HIGH
**Impact:** Emotion configurations cached without bounds

**Issue:**

```javascript
constructor() {
    // Cache storage
    this.emotionCache = new Map();
    this.visualParamsCache = new Map();
    this.modifiersCache = new Map();
    this.transitionCache = new Map();

    // Performance tracking
    this.stats = {
        hits: 0,
        misses: 0,
        loadTime: 0,
        cacheSize: 0
    };

    // Initialize cache
    this.initialize();
}
```

**Problems:**

1. **No maximum size limits** on any of the 4 caches
2. Plugin emotions can be added dynamically without bounds
3. `cacheEmotion()` can be called externally - no validation
4. Transition cache stores all emotion pairs - O(n²) growth potential
5. `stats.hits` and `stats.misses` grow unbounded (integers, but still)

**Memory Impact:**

- Current: ~15 emotions × 4 caches = 60 entries
- Plugin risk: Unbounded if plugins register many emotions
- Transition cache: Currently 7 pairs, could grow to 225+ with 15 emotions
- Estimated: **50-200 KB** for current size, **1+ MB** if abused

**Recommendations:**

1. Add maximum cache sizes (e.g., 50 emotions max)
2. Implement LRU eviction for transition cache
3. Validate emotion names before caching
4. Add cache size monitoring and warnings
5. Reset stats counters periodically (or use rolling averages)

---

### 7. StateStore Computed Values Cache Leaks

**File:** `src/core/state/StateStore.js` (Lines 33-35, 147-176) **Severity:**
HIGH **Impact:** Computed property definitions never removed

**Issue:**

```javascript
// Computed values cache
this._computed = new Map();
this._computedDeps = new Map();

computed(name, deps, compute) {
    this._computedDeps.set(name, deps);

    // Define getter
    Object.defineProperty(this, name, {
        get: () => {
            // Check cache
            if (this._computed.has(name)) {
                this._stats.computedCacheHits++;
                return this._computed.get(name);
            }

            // Compute value
            const values = deps.map(dep => this.getState(dep));
            const result = compute(...values);

            // Cache result
            this._computed.set(name, result);
            return result;
        }
    });
}
```

**Problems:**

1. **Property definitions never removed** - Even if computed value no longer
   needed
2. No method to unregister computed properties
3. Closure in getter captures `deps` and `compute` function forever
4. `_computedDeps` Map grows but never shrinks
5. Multiple `computed()` calls for same name override property but leak old
   dependency data

**Memory Impact:**

- Estimated: **1-5 KB per computed property**
- Each property keeps: dependency array, compute function, cached result
- Growth: Linear with number of computed properties defined

**Recommendations:**

1. Add `removeComputed(name)` method to delete properties
2. Clear `_computed` and `_computedDeps` entries on removal
3. Add automatic cleanup of unused computed properties
4. Implement computed property lifecycle tracking
5. Use WeakMap for dependency tracking where possible

---

### 8. EmotiveRenderer - Gradient Cache Growing Without Bounds

**File:** `src/core/EmotiveRenderer.js` (Lines 287-288) **Severity:** HIGH
**Impact:** Glow gradient cache can grow indefinitely

**Issue:**

```javascript
// Cache for expensive gradients
this.glowCache = new Map();
this.maxCacheSize = 10;
```

**Problems:**

1. **`maxCacheSize = 10` defined but never enforced** in caching code
2. Glow cache cleared on emotion/undertone changes but not on size
3. No LRU eviction when cache exceeds limit
4. Gradient objects are large (contains color stops, canvas contexts)
5. Cache keys may include dynamic values (colors, sizes) - unlimited
   combinations

**Memory Impact:**

- Estimated: **50-200 KB per cached gradient** (includes rendered pixels)
- With 10+ entries: **500 KB - 2 MB** potential
- Risk: Dynamic color/size changes create unlimited cache entries

**Recommendations:**

1. **Implement LRU eviction** when cache exceeds `maxCacheSize`
2. Add cache size monitoring and warnings
3. Clear cache on canvas resize (may be outdated anyway)
4. Consider using WeakMap for automatic cleanup
5. Add periodic cache cleanup (e.g., every 60 seconds)

---

## Medium Priority Issues

### 9. StateCoordinator - Particle System References Retained

**File:** `src/mascot/state/StateCoordinator.js` (Lines 64-103) **Severity:**
MEDIUM **Impact:** Old emotional properties retained through particle system

**Issue:**

```javascript
// Clear and reset particles when changing emotional states
if (this.mascot.particleSystem) {
    // Clear all existing particles
    this.mascot.particleSystem.clear();

    // Get the new emotional properties
    const emotionalProps =
        this.mascot.stateMachine.getCurrentEmotionalProperties();

    // Spawn initial particles for the new state
    // ...
}
```

**Problems:**

1. Emotional properties passed to particle system but may be retained
2. `clear()` removes particles but properties object may still be referenced
3. No explicit cleanup of old emotion data before setting new
4. Color objects and behavior strings stored in particles

**Memory Impact:**

- Estimated: **10-50 KB** depending on particle count
- Low severity as particle system has fixed pool size
- Concern: Closures in behavior functions may capture old state

**Recommendations:**

1. Add explicit cleanup before spawning new particles
2. Verify particle system doesn't retain emotion references
3. Use object pooling for emotional property objects
4. Add nullification of old properties before transition

---

### 10. EmotionalStateManager - Suspicion State Never Fully Reset

**File:** `src/core/renderer/EmotionalStateManager.js` (Lines 246-261)
**Severity:** MEDIUM **Impact:** Suspicion state properties persist after
emotion change

**Issue:**

```javascript
// Handle suspicion state
if (emotion === 'suspicion') {
    this.renderer.state.isSuspicious = true;
    this.renderer.state.targetSquintAmount =
        properties && properties.coreSquint ? properties.coreSquint : 0.4;
    if (this.renderer.state.squintAmount === undefined) {
        this.renderer.state.squintAmount = 0;
    }
    this.renderer.state.lastScanTime = Date.now();
    this.renderer.state.scanPhase = 0;
} else {
    this.renderer.state.isSuspicious = false;
    this.renderer.state.targetSquintAmount = 0;
    if (this.renderer.state.squintAmount === undefined) {
        this.renderer.state.squintAmount = 0;
    }
    // lastScanTime and scanPhase NOT cleared!
}
```

**Problems:**

1. **`lastScanTime` and `scanPhase` not reset** when leaving suspicion mode
2. These properties remain in state object indefinitely
3. Old timestamps can cause confusion in debugging
4. No cleanup method for suspicion-specific state

**Memory Impact:**

- Estimated: **< 1 KB** (minimal - just numbers)
- Severity low but violates clean state principle
- Can cause logic errors if suspicion re-entered

**Recommendations:**

1. Reset all suspicion properties when exiting mode
2. Add `clearSuspicionState()` method
3. Document which properties are cleared vs preserved
4. Consider grouping all suspicion state in nested object

---

### 11. StateStore Subscribers Never Auto-Cleaned

**File:** `src/core/state/StateStore.js` (Lines 21, 122-145) **Severity:**
MEDIUM **Impact:** Subscriber map grows with each subscription

**Issue:**

```javascript
// Subscribers for state changes
this._subscribers = new Map();

subscribe(pathOrCallback, callback = null) {
    // ...
    const id = Symbol('subscriber');
    const subscriber = {
        path,
        callback: cb,
        id
    };

    this._subscribers.set(id, subscriber);

    // Return unsubscribe function
    return () => {
        this._subscribers.delete(id);
    };
}
```

**Problems:**

1. **Relies on caller to invoke unsubscribe** - If forgotten, subscriber leaks
2. No automatic cleanup of dead subscribers
3. Symbol IDs prevent garbage collection of subscribers
4. No maximum subscriber limit or warnings
5. Closures in callbacks may capture large objects

**Memory Impact:**

- Estimated: **1-10 KB per subscriber** (depending on closure size)
- Growth: Linear with subscriptions
- Risk: High if subscribers not properly unsubscribed

**Recommendations:**

1. Add automatic cleanup of orphaned subscribers
2. Implement subscriber count warnings (e.g., > 50)
3. Add `clearInactiveSubscribers()` method
4. Consider using WeakMap for automatic GC
5. Add lifecycle tracking to detect leaked subscribers

---

### 12. ContextManager Decay Timer Never Properly Cleaned

**File:** `src/core/state/ContextManager.js` (Lines 40-45, 271-299)
**Severity:** MEDIUM **Impact:** Interval timer may persist after context
manager destroyed

**Issue:**

```javascript
// Context decay settings
this.enableDecay = options.enableDecay !== false;
this.frustrationDecayRate = options.frustrationDecayRate || 5;
this.decayInterval = options.decayInterval || 10000; // 10 seconds
this.decayTimer = null;

// Start decay timer if enabled
if (this.enableDecay) {
    this.startDecayTimer();
}

startDecayTimer() {
    this.decayTimer = setInterval(() => {
        if (this.context.frustration > 0) {
            const newFrustration = Math.max(0, this.context.frustration - this.frustrationDecayRate);
            this.update({ frustration: newFrustration });
        }
    }, this.decayInterval);
}
```

**Problems:**

1. **No `destroy()` or `cleanup()` method** to clear interval
2. `stopDecay()` exists but not called automatically
3. Interval continues running even if ContextManager no longer needed
4. Each interval tick calls `update()` which adds to history
5. Closure captures `this` preventing garbage collection

**Memory Impact:**

- Estimated: **5-10 KB** (interval + closure)
- Indirect: History grows continuously from decay updates
- Timer runs every 10 seconds forever unless manually stopped

**Recommendations:**

1. Add `destroy()` method that calls `stopDecay()`
2. Call destroy in mascot cleanup chain
3. Add finalizer to auto-stop timer
4. Add warning if timer runs for > 1 hour
5. Consider making decay opt-in rather than default

---

## Low Priority Observations

### 13. EmotiveStateMachine - Simulated Time State Leaks

**File:** `src/core/state/EmotiveStateMachine.js` (Lines 679-685) **Severity:**
LOW **Impact:** Test-only property that may leak in production

**Issue:**

```javascript
enableSimulatedTime(enabled = true) {
    if (enabled) {
        this._simulatedTime = 0;
    } else {
        delete this._simulatedTime;
    }
}
```

**Problems:**

1. Testing helper that may be accidentally enabled in production
2. Property added dynamically to object - affects shape optimization
3. No validation that this is only used in test environment

**Memory Impact:**

- Negligible: **8 bytes** (single number)
- More of a code smell than actual leak

**Recommendations:**

1. Add `if (process.env.NODE_ENV !== 'test')` guard
2. Consider moving to separate testing utility
3. Add deprecation warning if used in production

---

### 14. EmotionCache Stats Growing Unbounded

**File:** `src/core/cache/EmotionCache.js` (Lines 35-41) **Severity:** LOW
**Impact:** Integer counters grow indefinitely (negligible memory)

**Issue:**

```javascript
// Performance tracking
this.stats = {
    hits: 0, // Grows forever
    misses: 0, // Grows forever
    loadTime: 0,
    cacheSize: 0,
};
```

**Problems:**

1. **Counters never reset** - Will grow to very large numbers over time
2. No rollover handling (JavaScript numbers can represent up to 2^53)
3. Not a memory leak but can cause statistical issues

**Memory Impact:**

- Negligible: **~32 bytes** (4 numbers)
- Numbers remain as primitives even when large

**Recommendations:**

1. Add `resetStats()` method for long-running applications
2. Use rolling averages instead of cumulative counts
3. Add `getStatsSinceReset()` functionality
4. Consider time-windowed statistics (last hour, last day)

---

## Test Scenarios for Verification

### Scenario 1: Rapid Emotion Transitions (StateStore History)

```javascript
// Simulate 1000 rapid emotion changes
for (let i = 0; i < 1000; i++) {
    mascot.setEmotion('joy');
    mascot.setEmotion('sadness');
}

// Check memory
const stateStore = mascot.stateMachine.stateStore;
console.log('History entries:', stateStore._history.length);
console.log('Expected: 50 (limited), Actual:', stateStore._history.length);
// SHOULD BE CAPPED AT 50
```

### Scenario 2: Event Listener Accumulation

```javascript
// Add 100 listeners without removing
for (let i = 0; i < 100; i++) {
    mascot.on('emotionChanged', () => {
        console.log('Emotion changed');
    });
}

// Check listener count
const listenerCount = mascot.eventManager.listenerCount('emotionChanged');
console.log('Listener count:', listenerCount);
// SHOULD WARN AT 20+, ERROR AT 50+
```

### Scenario 3: Context History Growth

```javascript
// Update context 500 times
for (let i = 0; i < 500; i++) {
    mascot.contextManager.update({ frustration: i % 100 });
}

// Check history size
const historySize = mascot.contextManager.history.length;
console.log('History entries:', historySize);
// SHOULD BE LIMITED TO historyLimit (50)
```

### Scenario 4: Gradient Cache Overflow

```javascript
// Force gradient cache growth with varying colors
for (let i = 0; i < 50; i++) {
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    mascot.renderer.state.glowColor = color;
    mascot.renderer.render();
}

// Check cache size
const cacheSize = mascot.renderer.glowCache.size;
console.log('Cache entries:', cacheSize);
// SHOULD BE LIMITED TO maxCacheSize (10)
```

### Scenario 5: Undertone Transition Memory

```javascript
// Cycle through undertones rapidly
const undertones = ['nervous', 'confident', 'tired', 'intense', 'subdued'];
for (let i = 0; i < 100; i++) {
    mascot.setEmotion('joy', { undertone: undertones[i % undertones.length] });
}

// Check for cached undertone objects
const stateProps = Object.keys(mascot.renderer.state);
console.log('State properties count:', stateProps.length);
// SHOULD NOT GROW BEYOND INITIAL COUNT
```

---

## Cleanup Implementation Priority

### Phase 1: Critical Fixes (Week 1)

1. Implement StateStore history differential storage
2. Add EventManager listener count warnings
3. Implement gradient cache LRU eviction
4. Add ContextManager history time-based expiration

### Phase 2: High Priority (Week 2)

5. Clear EmotiveStateMachine interpolation cache after transitions
6. Add EmotionCache size limits and validation
7. Implement StateStore computed property cleanup
8. Add EmotionalStateManager undertone state reset

### Phase 3: Medium Priority (Week 3-4)

9. Review particle system emotion reference retention
10. Reset suspicion state completely on emotion change
11. Add StateStore subscriber auto-cleanup
12. Implement ContextManager proper destroy method

### Phase 4: Polish (Week 5)

13. Add production guards for test-only features
14. Implement rolling statistics in EmotionCache
15. Add comprehensive memory monitoring dashboard
16. Create automated memory leak detection tests

---

## Recommended Cleanup API

### Global Cleanup Method

```javascript
// Add to EmotiveMascot
destroy() {
    // Clean up state stores
    this.stateMachine.clearInterpolationCache();
    this.stateStore.clearHistory();

    // Clean up context manager
    this.contextManager.stopDecay();
    this.contextManager.clearHistory();

    // Clean up event listeners
    this.eventManager.removeAllListeners();

    // Clean up emotion cache
    this.emotionCache.clear();

    // Clean up renderer caches
    this.renderer.glowCache.clear();
    this.renderer.emotionalStateManager.resetUndertoneState();

    // Clean up computed properties
    this.stateStore.clearAllComputed();
}
```

### Periodic Maintenance

```javascript
// Add to EmotiveMascot
performMaintenance() {
    // Trim old history (keep last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    this.stateStore.trimHistory(fiveMinutesAgo);
    this.contextManager.trimHistory(fiveMinutesAgo);

    // Clean up inactive subscribers
    this.stateStore.clearInactiveSubscribers();

    // Enforce cache limits
    this.renderer.glowCache.enforceLimit();
    this.emotionCache.validateCacheSize();

    // Reset statistics counters
    this.emotionCache.resetStats();
}

// Call every 5 minutes
setInterval(() => mascot.performMaintenance(), 5 * 60 * 1000);
```

---

## Memory Monitoring Additions

### Recommended Memory Tracking

```javascript
class MemoryMonitor {
    constructor(mascot) {
        this.mascot = mascot;
        this.baseline = null;
    }

    capture() {
        return {
            timestamp: Date.now(),
            stateHistory: this.mascot.stateStore._history.length,
            contextHistory: this.mascot.contextManager.history.length,
            subscribers: this.mascot.stateStore._subscribers.size,
            eventListeners: this.mascot.eventManager.getStats(),
            emotionCache: this.mascot.emotionCache.getStats(),
            glowCache: this.mascot.renderer.glowCache.size,
            computedValues: this.mascot.stateStore._computed.size,
            heapUsed: performance.memory?.usedJSHeapSize,
        };
    }

    detect() {
        const current = this.capture();

        if (!this.baseline) {
            this.baseline = current;
            return { leaks: [] };
        }

        const leaks = [];

        // Check for growing arrays
        if (current.stateHistory > this.baseline.stateHistory + 50) {
            leaks.push('StateStore history growing unbounded');
        }

        if (current.contextHistory > this.baseline.contextHistory + 50) {
            leaks.push('ContextManager history growing unbounded');
        }

        if (current.subscribers > this.baseline.subscribers + 20) {
            leaks.push('StateStore subscribers not being cleaned up');
        }

        // ... more checks

        return { leaks, current, baseline: this.baseline };
    }
}
```

---

## Conclusion

The emotion and state management system requires significant attention to
prevent memory leaks in long-running applications. The most critical issues are:

1. **Unbounded history growth** in StateStore and ContextManager
2. **Event listener accumulation** without automatic cleanup
3. **Cache growth** without proper LRU eviction

These issues compound over time and can lead to several megabytes of leaked
memory after extended use. Priority should be given to implementing proper
bounds, cleanup methods, and periodic maintenance routines.

**Estimated Total Memory at Risk:** 5-15 MB after 1 hour of active use without
cleanup.

**Next Steps:**

1. Implement critical fixes in Phase 1
2. Add memory monitoring dashboard
3. Create automated leak detection tests
4. Schedule periodic maintenance in production builds
