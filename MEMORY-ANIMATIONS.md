# Animation System Memory Leak Audit Report

**Project:** Emotive Engine **Audit Focus:** Animation Systems **Agent:** Agent
5 **Date:** 2025-11-12 **Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium |
🟢 Low

---

## Executive Summary

This audit examined all animation-related systems in the Emotive Engine codebase
for memory leaks, focusing on:

- Animation queues and timelines
- Tween/interpolation state
- Animation callbacks and chains
- RAF (requestAnimationFrame) loops
- setTimeout/setInterval timers
- Easing function caching

**Total Issues Found:** 18 **Critical:** 4 | **High:** 8 | **Medium:** 4 |
**Low:** 2

---

## Critical Issues 🔴

### 1. GestureScheduler - setInterval Never Cleared on Mascot Destroy

**File:** `src/core/GestureScheduler.js` **Lines:** 592-594, 622-627
**Severity:** 🔴 Critical

**Issue:**

```javascript
startProcessing() {
    if (this.processInterval) return;

    // Use setInterval for consistent timing checks
    this.processInterval = setInterval(() => {
        this.processQueue();
    }, 16); // ~60fps checking
}
```

The GestureScheduler creates a setInterval that runs at 60fps (every 16ms), but
there's no destroy method to clean it up. When the mascot is destroyed or
recreated, this interval continues running forever.

**Impact:**

- Interval runs 60 times per second indefinitely
- Holds reference to entire GestureScheduler instance
- Prevents GC of mascot, gestures, and all related objects
- Multiple mascot creations = multiple intervals = severe CPU and memory waste

**Recommendation:**

```javascript
destroy() {
    this.stopProcessing();
    this.queue = [];
    this.activeGestures.clear();
    this.gestureQueues.clear();
    this.currentGesture = null;
    this.onGestureQueued = null;
    this.onGestureTriggered = null;
    this.onGestureCompleted = null;
}
```

---

### 2. GestureScheduler - setTimeout Timers Not Tracked or Cleared

**File:** `src/core/GestureScheduler.js` **Lines:** 494-519 **Severity:** 🔴
Critical

**Issue:**

```javascript
executeGesture(queueItem) {
    // ... execute gesture ...

    // Schedule completion and queue processing
    setTimeout(() => {
        // Mark as inactive
        this.activeGestures.delete(gestureName);
        // ... more cleanup ...
    }, duration);
}
```

Every gesture execution creates a setTimeout, but:

1. No tracking of timeout IDs
2. No way to cancel pending timeouts
3. No cleanup in destroy
4. Timeouts hold closure over queueItem and entire scheduler

**Impact:**

- Long-running gestures (2000ms+) create zombies if mascot destroyed
- Each timeout holds full closure including scheduler state
- Rapid gesture changes = accumulated pending timeouts
- Memory leak scales with gesture frequency

**Recommendation:** Track all timeout IDs and clear them on destroy:

```javascript
this.activeTimeouts = new Set();

executeGesture(queueItem) {
    const timeoutId = setTimeout(() => {
        this.activeTimeouts.delete(timeoutId);
        // ... cleanup ...
    }, duration);
    this.activeTimeouts.add(timeoutId);
}

destroy() {
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts.clear();
}
```

---

### 3. AnimationLoopManager - Callbacks Not Cleared on Component Destroy

**File:** `src/core/AnimationLoopManager.js` **Lines:** 66-91, 362-366
**Severity:** 🔴 Critical

**Issue:**

```javascript
register(callback, priority = AnimationPriority.MEDIUM, context = null) {
    const id = ++this.callbackIdCounter;

    this.callbacks.set(id, {
        callback,
        priority,
        context,  // Holds reference to component!
        lastRun: 0,
        runCount: 0,
        totalTime: 0,
        enabled: true
    });

    return id;
}
```

The AnimationLoopManager is a singleton that stores references to all registered
animation callbacks. When components are destroyed, if they don't call
`unregister()`, the callback and context remain in the Map forever.

**Impact:**

- Destroyed components remain in memory
- RAF loop continues calling disabled callbacks
- Memory grows with every component creation/destruction cycle
- Singleton means leak persists for entire session

**Recommendation:**

1. Add automatic cleanup on disable after timeout
2. Add weak reference support for contexts
3. Document required cleanup in component lifecycle
4. Add memory monitoring and warnings

---

### 4. ElementTargetingAnimations - Multiple requestAnimationFrame Loops Not Cancelled

**File:** `src/core/positioning/elementTargeting/ElementTargetingAnimations.js`
**Lines:** 59-86 (and similar in other animation methods) **Severity:** 🔴
Critical

**Issue:**

```javascript
moveToElementWithBounce(targetSelector, bounceOptions = {}, ...) {
    // ...
    const animate = currentTime => {
        // ... animation logic ...

        if (progress < 1) {
            this.activeAnimations.set(animationId, animate);
            requestAnimationFrame(animate);  // NEW RAF LOOP!
        } else {
            this.activeAnimations.delete(animationId);
        }
    };

    this.activeAnimations.set(animationId, animate);
    requestAnimationFrame(animate);  // START RAF LOOP
}
```

**Problems:**

1. Each animation method (bounce, shake, pulse, wiggle, custom) creates a
   separate RAF loop
2. No tracking of RAF IDs - only the callback function is stored
3. `stopAllAnimations()` only clears the Map, doesn't cancel RAF
4. Destroy doesn't cancel active RAF loops

**Impact:**

- Each animation = infinite RAF loop until completion
- No way to cancel animations mid-flight
- Multiple simultaneous animations = multiple RAF loops
- Destroying component leaves RAF loops running
- Severe CPU and memory waste

**Recommendation:** Track RAF IDs and cancel them:

```javascript
this.activeAnimationFrames = new Map();

const animate = currentTime => {
    if (progress < 1) {
        const rafId = requestAnimationFrame(animate);
        this.activeAnimationFrames.set(animationId, rafId);
    } else {
        this.activeAnimations.delete(animationId);
        this.activeAnimationFrames.delete(animationId);
    }
};

stopAllAnimations() {
    this.activeAnimationFrames.forEach(rafId => cancelAnimationFrame(rafId));
    this.activeAnimationFrames.clear();
    this.activeAnimations.clear();
}
```

---

## High Priority Issues 🟠

### 5. PositionController - Animation RAF Not Cancelled on stopAnimation

**File:** `src/utils/PositionController.js` **Lines:** 113-151 **Severity:** 🟠
High

**Issue:**

```javascript
stopAnimation() {
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }
    this.isAnimating = false;
}

startAnimation() {
    const animate = currentTime => {
        if (!this.isAnimating) return;  // Early exit but RAF already scheduled
        // ... animation logic ...
        if (progress >= 1) {
            this.isAnimating = false;
            this.onAnimationComplete();
        } else {
            this.animationId = requestAnimationFrame(animate);  // Only stored if continuing
        }
    };

    this.animationId = requestAnimationFrame(animate);  // Initial RAF
}
```

**Problem:** The initial `requestAnimationFrame` creates a pending callback. If
`stopAnimation()` is called before the first frame, or if a new animation starts
immediately, the old RAF callback can still fire once, potentially causing:

- Animation state inconsistencies
- Duplicate RAF loops
- Callback execution after component destroyed

**Impact:**

- Timing-sensitive race conditions
- Potential for multiple concurrent animations
- Memory held by closures until RAF fires

**Recommendation:** Always track and cancel the initial RAF:

```javascript
startAnimation() {
    // Cancel any existing animation first
    this.stopAnimation();

    const animate = currentTime => {
        if (!this.isAnimating) {
            this.animationId = null;
            return;
        }
        // ... rest of animation ...
    };

    this.animationId = requestAnimationFrame(animate);
}
```

---

### 6. Animation.js - Multiple RAF Loops in Path/Time Animations

**File:** `src/core/positioning/Animation.js` **Lines:** 96-103, 144-150
**Severity:** 🟠 High

**Issue:**

```javascript
moveToPath(points, speed, options) {
    // ...
    const followPath = currentTime => {
        // ... path following logic ...

        if (this.isRunning) {
            requestAnimationFrame(followPath);  // Unconditional RAF!
        }
    };

    requestAnimationFrame(followPath);
}
```

**Problems:**

1. No tracking of RAF IDs
2. `stopAllAnimations()` sets `isRunning = false` but doesn't cancel pending RAF
3. Pending callbacks still execute once more
4. Multiple animation types can run simultaneously

**Impact:**

- Stopped animations execute one more frame
- Cannot immediately stop animations
- Memory held by closures until execution
- CPU waste from unnecessary frame callbacks

**Recommendation:**

```javascript
this.animationFrameIds = new Map();

moveToPath(points, speed, options) {
    const callbackId = 'path';
    const followPath = currentTime => {
        if (!this.isRunning) {
            this.animationFrameIds.delete(callbackId);
            return;
        }
        // ... logic ...
        const rafId = requestAnimationFrame(followPath);
        this.animationFrameIds.set(callbackId, rafId);
    };

    const rafId = requestAnimationFrame(followPath);
    this.animationFrameIds.set(callbackId, rafId);
}

stopAllAnimations() {
    this.isRunning = false;
    this.animationFrameIds.forEach(rafId => cancelAnimationFrame(rafId));
    this.animationFrameIds.clear();
}
```

---

### 7. ShapeMorpher - setTimeout Not Cleared on Destroy

**File:** `src/core/ShapeMorpher.js` **Lines:** 367-371, 933-963 **Severity:**
🟠 High

**Issue:**

```javascript
completeMorph(skipQueue = false) {
    // ...
    if (!skipQueue && this.queuedMorph) {
        const queued = this.queuedMorph;
        this.queuedMorph = null;

        // Small delay to ensure smooth transition
        this.queuedMorphTimeout = setTimeout(() => {
            this.morphTo(queued.targetShape, queued.options);
            this.queuedMorphTimeout = null;
        }, 50);
    }
}

destroy() {
    // Clear any pending timeouts
    if (this.queuedMorphTimeout) {
        clearTimeout(this.queuedMorphTimeout);
        this.queuedMorphTimeout = null;
    }
    // ... rest of cleanup ...
}
```

**Good:** The destroy method does clear the timeout.

**Problem:** If `morphTo()` is called while a queued morph timeout is pending,
the old timeout is not cleared:

```javascript
morphTo(targetShape, options = {}) {
    // ...
    if (this.isTransitioning && !options.force) {
        this.queuedMorph = { targetShape, options };
        return 'queued';  // Doesn't clear old queuedMorphTimeout!
    }
}
```

**Impact:**

- Multiple queued morphs = multiple pending timeouts
- Old timeouts can trigger after being replaced
- Race conditions in morph queue processing
- Memory leak of queued morph data

**Recommendation:**

```javascript
morphTo(targetShape, options = {}) {
    // ...
    if (this.isTransitioning && !options.force) {
        // Clear any existing queued morph timeout
        if (this.queuedMorphTimeout) {
            clearTimeout(this.queuedMorphTimeout);
            this.queuedMorphTimeout = null;
        }
        this.queuedMorph = { targetShape, options };
        return 'queued';
    }
}
```

---

### 8. BreathingAnimationController - RAF Loop Not Tracked for Cleanup

**File:** `src/mascot/animation/BreathingAnimationController.js` **Lines:**
20-52 **Severity:** 🟠 High

**Issue:**

```javascript
startBreathingAnimation() {
    // Cancel any existing breathing animation
    if (this.mascot.breathingAnimationId) {
        cancelAnimationFrame(this.mascot.breathingAnimationId);
    }

    const animate = () => {
        if (!this.mascot.breathePattern || !this.mascot.isRunning) return;
        // ... animation logic ...

        // Continue animation
        this.mascot.breathingAnimationId = requestAnimationFrame(animate);
    };

    // ... setup ...
    animate();  // Direct call without RAF!
}
```

**Problems:**

1. Initial call to `animate()` is direct, not via RAF
2. If `breathePattern` or `isRunning` is false on first call, no RAF is
   scheduled but method returns normally
3. If RAF is cancelled but `breathePattern` still exists, state becomes
   inconsistent

**Impact:**

- Breathing animation can get stuck in inconsistent state
- No RAF scheduled but animation appears active
- Potential for multiple breathing animations if restarted quickly

**Recommendation:**

```javascript
startBreathingAnimation() {
    if (this.mascot.breathingAnimationId) {
        cancelAnimationFrame(this.mascot.breathingAnimationId);
        this.mascot.breathingAnimationId = null;
    }

    const animate = () => {
        if (!this.mascot.breathePattern || !this.mascot.isRunning) {
            this.mascot.breathingAnimationId = null;
            return;
        }
        // ... animation logic ...
        this.mascot.breathingAnimationId = requestAnimationFrame(animate);
    };

    this.mascot.breathingAnimationId = requestAnimationFrame(animate);
}
```

---

### 9. OrbScaleAnimator - RAF Loop Not Cancelled on Mascot Stop

**File:** `src/mascot/animation/OrbScaleAnimator.js` **Lines:** 39-65
**Severity:** 🟠 High

**Issue:**

```javascript
startScaleAnimation(targetScale, duration, easing) {
    const startScale = this.mascot.currentOrbScale || 1.0;
    const startTime = Date.now();

    const animate = () => {
        // ... animation logic ...

        // Continue animation
        if (progress < 1 && this.mascot.isRunning) {
            requestAnimationFrame(animate);  // NOT TRACKED!
        }
    };

    animate();  // Start immediately
}
```

**Problems:**

1. No RAF ID tracking
2. No way to cancel animation externally
3. Relies on `mascot.isRunning` to stop, but RAF already scheduled
4. No cleanup method

**Impact:**

- Animation continues for one frame after mascot stops
- No immediate cancellation possible
- Multiple scale animations can overlap
- Memory held by closures until animation completes

**Recommendation:** Add RAF tracking and cleanup:

```javascript
startScaleAnimation(targetScale, duration, easing) {
    // Cancel any existing scale animation
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }

    const animate = () => {
        // ... animation logic ...
        if (progress < 1 && this.mascot.isRunning) {
            this.animationId = requestAnimationFrame(animate);
        } else {
            this.animationId = null;
        }
    };

    this.animationId = requestAnimationFrame(animate);
}

destroy() {
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }
}
```

---

### 10. RotationBrake - No Destroy Method to Clear Callbacks

**File:** `src/core/animation/RotationBrake.js` **Lines:** 6-227 **Severity:**
🟠 High

**Issue:**

```javascript
export class RotationBrake {
    constructor(renderer) {
        this.renderer = renderer;
        this.onComplete = null;
        this.onProgress = null;
        this.resolvePromise = null;
        // ... state ...
    }

    brakeToTarget(targetAngle, options = {}) {
        return new Promise(resolve => {
            this.onProgress = onProgress;
            this.onComplete = onComplete;
            // ...
            this.resolvePromise = resolve;
        });
    }

    // NO DESTROY METHOD!
}
```

**Problems:**

1. No destroy method to clear callbacks and promises
2. Holds references to `onProgress`, `onComplete`, `resolvePromise`
3. Stores reference to entire `renderer`
4. If renderer destroyed while brake active, refs held indefinitely

**Impact:**

- Renderer cannot be GC'd while brake exists
- Callbacks and promises held forever if brake incomplete
- Emergency stop doesn't clear promises
- Memory leak if multiple brakes created

**Recommendation:**

```javascript
destroy() {
    this.stop();

    // Clear all callbacks and promises
    this.onComplete = null;
    this.onProgress = null;

    if (this.resolvePromise) {
        this.resolvePromise();
        this.resolvePromise = null;
    }

    this.renderer = null;
}
```

---

### 11. GestureAnimator - Large Gesture State Object Never Cleared

**File:** `src/core/renderer/GestureAnimator.js` **Lines:** 35-77 **Severity:**
🟠 High

**Issue:**

```javascript
constructor(renderer) {
    // ...
    this.gestureAnimations = {
        bounce: { active: false, progress: 0, params: {} },
        pulse: { active: false, progress: 0, params: {} },
        shake: { active: false, progress: 0, params: {} },
        // ... 30+ gestures ...
        charleston: { active: false, progress: 0, params: {} }
    };
}
```

**Problems:**

1. No destroy method to clear gesture state
2. Each gesture stores params, which can contain closures and configs
3. State accumulates over time (randomAngles, flashWave data, etc.)
4. No cleanup of accumulated properties

**Impact:**

- Large object held in memory forever
- Params can contain large configs or closures
- Random state properties never cleaned (e.g., `anim.flashWave`,
  `anim.randomAngle`)
- Memory grows with gesture usage

**Recommendation:**

```javascript
destroy() {
    // Clear all gesture state
    Object.keys(this.gestureAnimations).forEach(key => {
        const anim = this.gestureAnimations[key];
        anim.active = false;
        anim.params = {};
        // Clear any accumulated properties
        Object.keys(anim).forEach(prop => {
            if (!['active', 'progress', 'params'].includes(prop)) {
                delete anim[prop];
            }
        });
    });

    // Clear animator references
    this.physicalGestureAnimator = null;
    this.visualEffectAnimator = null;
    this.breathGestureAnimator = null;
    this.movementGestureAnimator = null;
    this.shapeTransformAnimator = null;
    this.expressionGestureAnimator = null;
    this.directionalGestureAnimator = null;
    this.complexAnimationAnimator = null;

    this.renderer = null;
}
```

---

### 12. AnimationController - Visibility Change Listeners Not Removed

**File:** `src/core/AnimationController.js` **Lines:** 96-104, 559-567
**Severity:** 🟠 High

**Issue:**

```javascript
constructor(errorBoundary, config = {}) {
    // ...
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);

    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('blur', this.handleWindowBlur);
        window.addEventListener('focus', this.handleWindowFocus);
    }
}

destroy() {
    this.stop();

    // Remove visibility change and focus listeners
    if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
    }
    // ... rest of cleanup ...
}
```

**Good:** Destroy method does remove listeners.

**Problem:** If multiple AnimationControllers are created (e.g., multiple
mascots), and any are created/destroyed rapidly, there's potential for:

1. Handlers to be bound multiple times if destroy fails
2. Bound methods hold closure over controller
3. Listeners not removed if destroy is not called

**Impact:**

- Medium - proper cleanup exists
- But relies on destroy being called
- Bound methods increase memory per instance
- Multiple mascots = multiple listener sets

**Recommendation:** Add safeguards:

```javascript
constructor() {
    // ...
    // Track if listeners added
    this._listenersAdded = false;

    if (typeof document !== 'undefined' && !this._listenersAdded) {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('blur', this.handleWindowBlur);
        window.addEventListener('focus', this.handleWindowFocus);
        this._listenersAdded = true;
    }
}

destroy() {
    // ...
    if (typeof document !== 'undefined' && this._listenersAdded) {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
        this._listenersAdded = false;
    }
}
```

---

## Medium Priority Issues 🟡

### 13. ProceduralAnimator - Animation Array Not Cleared on Destroy

**File:** `src/3d/animation/ProceduralAnimator.js` **Lines:** 46-63, 253-261
**Severity:** 🟡 Medium

**Issue:**

```javascript
update(deltaTime) {
    this.time += deltaTime;

    // Remove completed animations
    for (let i = this.animations.length - 1; i >= 0; i--) {
        const anim = this.animations[i];
        // ...
        if (progress >= 1.0) {
            if (anim.callbacks && anim.callbacks.onComplete) {
                anim.callbacks.onComplete();  // Callback might hold refs
            }
            this.animations.splice(i, 1);
        }
    }
}

destroy() {
    this.stopAll();
    this.animations = null;  // Sets to null, but doesn't clear callbacks first
    this.currentAnimation = null;
    this.time = 0;
}
```

**Problem:** The destroy method calls `stopAll()` which sets `animations = []`,
then sets to null. However, it doesn't clear callbacks from animation objects
before clearing the array.

**Impact:**

- Callbacks can hold closures over large contexts
- Array of animation objects held until GC
- Callbacks reference external objects

**Recommendation:**

```javascript
destroy() {
    // Clear callbacks from all animations
    this.animations.forEach(anim => {
        if (anim.callbacks) {
            anim.callbacks.onComplete = null;
            anim.callbacks = null;
        }
    });

    this.stopAll();
    this.animations = null;
    this.currentAnimation = null;
    this.time = 0;
}
```

---

### 14. GestureBlender - Reused Temp Objects Accumulate Properties

**File:** `src/3d/animation/GestureBlender.js` **Lines:** 22-27, 120-126
**Severity:** 🟡 Medium

**Issue:**

```javascript
constructor() {
    // Temp objects for quaternion calculations (reused to avoid allocations)
    this.tempEuler = new THREE.Euler();
    this.tempQuat = new THREE.Quaternion();
    this.accumulatedRotationQuat = new THREE.Quaternion();
    this.finalQuaternion = new THREE.Quaternion();
}

destroy() {
    this.tempEuler = null;
    this.tempQuat = null;
    this.accumulatedRotationQuat = null;
    this.finalQuaternion = null;
}
```

**Good:** Destroy clears references.

**Minor Issue:** Three.js objects can accumulate event listeners or internal
state. Setting to null is correct, but there's no explicit cleanup of Three.js
objects themselves.

**Impact:**

- Low - Three.js objects are small
- No event listeners detected
- Mostly just math state

**Recommendation:** Current implementation is acceptable. Three.js objects will
be GC'd when refs cleared.

---

### 15. ElementTargetingAnimations - Queue Processing setTimeout Not Tracked

**File:** `src/core/positioning/elementTargeting/ElementTargetingAnimations.js`
**Lines:** 346-351 **Severity:** 🟡 Medium

**Issue:**

```javascript
processAnimationQueue() {
    // ...
    if (animation) {
        const cleanup = this.executeAnimation(animation);
        if (cleanup) {
            setTimeout(() => {  // Timeout not tracked!
                cleanup();
                this.isAnimating = false;
                this.processAnimationQueue();
            }, animation.duration || 1000);
        }
    }
}
```

**Problem:** The setTimeout in queue processing is not tracked or cancellable.

**Impact:**

- If destroyed during queue processing, timeout fires anyway
- Cleanup runs on destroyed component
- Queue continues processing after destroy

**Recommendation:**

```javascript
this.queueTimeouts = new Set();

processAnimationQueue() {
    // ...
    const timeoutId = setTimeout(() => {
        this.queueTimeouts.delete(timeoutId);
        cleanup();
        this.isAnimating = false;
        this.processAnimationQueue();
    }, animation.duration || 1000);
    this.queueTimeouts.add(timeoutId);
}

destroy() {
    this.queueTimeouts.forEach(id => clearTimeout(id));
    this.queueTimeouts.clear();
    this.stopAllAnimations();
    super.destroy();
}
```

---

### 16. Animation.js - Animation Callbacks Map Not Cleared

**File:** `src/core/positioning/Animation.js` **Lines:** 24-28, 261-276
**Severity:** 🟡 Medium

**Issue:**

```javascript
constructor(positionController) {
    this.positionController = positionController;
    this.isRunning = false;
    this.animationCallbacks = new Map();  // Stores animation functions
    // ...
}

stopAllAnimations() {
    this.isRunning = false;
    this.animationCallbacks.clear();  // Clears but doesn't cancel RAFs
    this.pathProgress = 0;
    this.timeProgress = 0;
    this.scrollProgress = 0;
}

destroy() {
    this.stopAllAnimations();
    this.positionController = null;
}
```

**Problem:**

1. Map is cleared but RAF loops continue for one more frame
2. No guarantee all callbacks are properly stopped

**Impact:**

- One more frame executes after stop
- Callbacks can still access destroyed controller
- Minor memory retention

**Recommendation:** Store RAF IDs alongside callbacks and cancel properly (see
issue #6).

---

## Low Priority Issues 🟢

### 17. BlinkAnimator - Date.now() Called Frequently

**File:** `src/3d/animation/BlinkAnimator.js` **Lines:** 89, 115 **Severity:**
🟢 Low

**Issue:**

```javascript
update(deltaTime) {
    // ...
    if (!this.isBlinking) {
        // Wait for next blink
        if (Date.now() >= this.nextBlinkTime) {
            this.startBlink();
        }
    }
}

getRandomBlinkTime() {
    // ...
    return min + Math.random() * (max - min);
}

completeBlink() {
    // ...
    this.nextBlinkTime = Date.now() + this.getRandomBlinkTime();
}
```

**Minor Issue:** `Date.now()` is called on every update frame. While not a leak,
it's a micro-optimization opportunity.

**Impact:**

- Negligible performance impact
- Not a memory leak

**Recommendation:** Pass timestamp from update loop instead of calling
Date.now():

```javascript
update(deltaTime, currentTime = Date.now()) {
    // Use currentTime parameter
}
```

---

### 18. BreathingAnimator - Emotion Pattern Map Never Cleared

**File:** `src/3d/animation/BreathingAnimator.js` **Lines:** 33-59, 153-156
**Severity:** 🟢 Low

**Issue:**

```javascript
constructor() {
    // ...
    this.emotionBreathPatterns = {
        happy: { rate: 1.1, depth: 1.2 },
        sad: { rate: 0.8, depth: 0.7 },
        // ... 20+ emotions ...
    };
}

destroy() {
    this.emotionBreathPatterns = null;
}
```

**Good:** Destroy clears the map.

**Minor Issue:** Large object with many emotion patterns held in every instance.

**Impact:**

- Low - patterns are small objects
- Could be static/shared across instances
- Not a leak per se, just inefficient

**Recommendation:** Make patterns static:

```javascript
static EMOTION_BREATH_PATTERNS = {
    happy: { rate: 1.1, depth: 1.2 },
    // ...
};

constructor() {
    // Reference static patterns
    this.emotionBreathPatterns = BreathingAnimator.EMOTION_BREATH_PATTERNS;
}
```

---

## Summary by Category

### RAF Loops (requestAnimationFrame)

- **4 Critical/High issues** with RAF not being tracked or cancelled
- Files: ElementTargetingAnimations.js, Animation.js, OrbScaleAnimator.js,
  BreathingAnimationController.js

### Timers (setTimeout/setInterval)

- **2 Critical issues** with timers not being tracked or cleared
- Files: GestureScheduler.js (both setInterval and setTimeout)

### Callbacks and Closures

- **5 High/Medium issues** with callbacks holding references
- Files: AnimationLoopManager.js, ProceduralAnimator.js, GestureAnimator.js

### Animation State

- **3 Medium issues** with state not being cleared
- Files: ShapeMorpher.js, ElementTargetingAnimations.js, Animation.js

### Event Listeners

- **1 High issue** with event listeners (properly handled but risky)
- File: AnimationController.js

---

## Recommendations Priority Order

1. **Fix GestureScheduler immediately** - setInterval and setTimeout leaks are
   severe
2. **Fix ElementTargetingAnimations RAF loops** - multiple uncancelled loops
3. **Fix AnimationLoopManager callback retention** - singleton holds all refs
4. **Add destroy methods to all animators** - RotationBrake, GestureAnimator
5. **Track all RAF IDs** - Animation.js, OrbScaleAnimator.js
6. **Clear all callbacks on destroy** - ProceduralAnimator, BreathingAnimator
7. **Optimize emotion patterns** - BreathingAnimator (low priority)

---

## Testing Recommendations

### Memory Leak Tests

```javascript
// Test 1: Gesture scheduling leak
for (let i = 0; i < 100; i++) {
    const mascot = new EmotiveMascot();
    mascot.express('bounce');
    mascot.destroy();
}
// Check: setInterval count should be 0, not 100

// Test 2: Element targeting leak
for (let i = 0; i < 50; i++) {
    targeting.moveToElementWithBounce('#target');
    targeting.destroy();
}
// Check: RAF count should be 0

// Test 3: Animation loop manager leak
for (let i = 0; i < 100; i++) {
    const id = animationLoopManager.register(() => {});
    // Don't unregister
}
// Check: callbacks.size should not grow unbounded
```

### Animation Cleanup Verification

```javascript
// Verify all RAF loops cancelled
function countActiveRAFs() {
    let count = 0;
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = () => {
        count++;
        return originalRAF.apply(window, arguments);
    };
    // Run animation tests
    // Verify count returns to 0 after destroy
}
```

---

**End of Report**
