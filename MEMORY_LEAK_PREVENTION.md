# Memory Leak Prevention Guidelines

## 🎯 Overview

This document provides guidelines for preventing memory leaks in the Emotive
Engine. Following these patterns ensures long-term stability and performance.

## 🔴 Critical Rules

### 1. **Always Track Timers and Animation Frames**

❌ **BAD - Untracked setTimeout**

```javascript
setTimeout(() => {
    this.state.active = false;
}, 1000);
```

✅ **GOOD - Tracked setTimeout**

```javascript
constructor() {
    this.activeTimeout = null;
}

someMethod() {
    this.activeTimeout = setTimeout(() => {
        this.state.active = false;
        this.activeTimeout = null;
    }, 1000);
}

destroy() {
    if (this.activeTimeout) {
        clearTimeout(this.activeTimeout);
        this.activeTimeout = null;
    }
}
```

### 2. **Always Cancel requestAnimationFrame**

❌ **BAD - Untracked RAF**

```javascript
animate() {
    requestAnimationFrame(() => this.animate());
    // ... animation code
}
```

✅ **GOOD - Tracked RAF**

```javascript
constructor() {
    this.rafId = null;
}

animate() {
    this.rafId = requestAnimationFrame(() => this.animate());
    // ... animation code
}

destroy() {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
}
```

### 3. **Always Remove Event Listeners**

❌ **BAD - No cleanup**

```javascript
setupListeners() {
    window.addEventListener('resize', this.handleResize);
}
```

✅ **GOOD - Proper cleanup with bound handlers**

```javascript
constructor() {
    this.boundHandleResize = this.handleResize.bind(this);
}

setupListeners() {
    window.addEventListener('resize', this.boundHandleResize);
}

destroy() {
    window.removeEventListener('resize', this.boundHandleResize);
}
```

### 4. **Always Implement destroy() Methods**

Every class that manages resources MUST have a `destroy()` method:

```javascript
class MyComponent {
    constructor() {
        this.rafId = null;
        this.timeouts = new Set();
        this.listeners = new Map();
    }

    destroy() {
        // 1. Cancel all animation frames
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // 2. Clear all timeouts
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts.clear();

        // 3. Remove all event listeners
        this.listeners.forEach((handler, element) => {
            element.removeEventListener('event', handler);
        });
        this.listeners.clear();

        // 4. Nullify references
        this.data = null;
        this.cache = null;
    }
}
```

## 📋 Component Development Checklist

Use this checklist when creating new components:

- [ ] Does my component use `setTimeout` or `setInterval`?
    - [ ] Are all timer IDs tracked in constructor?
    - [ ] Are all timers cleared in `destroy()`?

- [ ] Does my component use `requestAnimationFrame`?
    - [ ] Are all RAF IDs tracked?
    - [ ] Are all RAFs cancelled in `destroy()`?

- [ ] Does my component add event listeners?
    - [ ] Are handlers bound in constructor?
    - [ ] Are all listeners removed in `destroy()`?

- [ ] Does my component create objects or arrays?
    - [ ] Are collections cleared in `destroy()`?
    - [ ] Are object references nullified?

- [ ] Does my component have a `destroy()` method?
    - [ ] Does it clean up all resources?
    - [ ] Is it called by parent components?

## 🏗️ Architectural Patterns

### Pattern 1: Use AnimationLoopManager (Recommended)

Instead of individual RAF calls, use the centralized loop manager:

```javascript
import {
    animationLoopManager,
    AnimationPriority,
} from './AnimationLoopManager.js';

class MyComponent {
    constructor() {
        this.loopCallbackId = null;
    }

    start() {
        this.loopCallbackId = animationLoopManager.register(
            (deltaTime, timestamp) => {
                this.update(deltaTime);
            },
            AnimationPriority.MEDIUM
        );
    }

    destroy() {
        if (this.loopCallbackId) {
            animationLoopManager.unregister(this.loopCallbackId);
            this.loopCallbackId = null;
        }
    }
}
```

### Pattern 2: Track Multiple Timers with Sets

```javascript
class MyComponent {
    constructor() {
        this.activeTimeouts = new Set();
        this.activeIntervals = new Set();
    }

    addTimeout(callback, delay) {
        const id = setTimeout(() => {
            callback();
            this.activeTimeouts.delete(id);
        }, delay);
        this.activeTimeouts.add(id);
        return id;
    }

    addInterval(callback, interval) {
        const id = setInterval(callback, interval);
        this.activeIntervals.add(id);
        return id;
    }

    destroy() {
        this.activeTimeouts.forEach(id => clearTimeout(id));
        this.activeTimeouts.clear();

        this.activeIntervals.forEach(id => clearInterval(id));
        this.activeIntervals.clear();
    }
}
```

### Pattern 3: Battery API and Async Resources

```javascript
class MyComponent {
    constructor() {
        this.batteryRef = null;
        this.boundBatteryHandler = null;
    }

    async setupBattery() {
        const battery = await navigator.getBattery();
        this.batteryRef = battery;

        this.boundBatteryHandler = () => this.handleBatteryChange();
        battery.addEventListener('levelchange', this.boundBatteryHandler);
    }

    destroy() {
        if (this.batteryRef && this.boundBatteryHandler) {
            this.batteryRef.removeEventListener(
                'levelchange',
                this.boundBatteryHandler
            );
            this.batteryRef = null;
            this.boundBatteryHandler = null;
        }
    }
}
```

## 🧪 Testing for Memory Leaks

### Manual Testing

1. **Open Chrome DevTools > Memory**
2. **Take heap snapshot**
3. **Perform actions (create/destroy components)**
4. **Take another snapshot**
5. **Compare snapshots - look for:**
    - Increasing number of Detached DOM elements
    - Growing number of listeners
    - Timer handles that don't decrease

### Automated Testing

Add cleanup verification to your tests:

```javascript
describe('MyComponent', () => {
    it('should clean up all resources on destroy', () => {
        const component = new MyComponent();
        component.start();

        // Track initial state
        const initialTimers = component.activeTimeouts.size;

        // Destroy
        component.destroy();

        // Verify cleanup
        expect(component.activeTimeouts.size).toBe(0);
        expect(component.rafId).toBeNull();
    });
});
```

## 🚨 Common Pitfalls

### Pitfall 1: Forgetting to Clear Before Reassigning

❌ **BAD**

```javascript
start() {
    this.rafId = requestAnimationFrame(() => this.update());
}
```

✅ **GOOD**

```javascript
start() {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(() => this.update());
}
```

### Pitfall 2: Using Arrow Functions for Event Listeners

❌ **BAD - Can't remove listener**

```javascript
element.addEventListener('click', () => this.handleClick());
```

✅ **GOOD - Bound handler can be removed**

```javascript
constructor() {
    this.boundHandleClick = this.handleClick.bind(this);
}

element.addEventListener('click', this.boundHandleClick);
// Later...
element.removeEventListener('click', this.boundHandleClick);
```

### Pitfall 3: Circular References

❌ **BAD - Circular reference prevents GC**

```javascript
class Parent {
    constructor() {
        this.child = new Child(this); // Child holds reference to Parent
    }
}

class Child {
    constructor(parent) {
        this.parent = parent; // Circular reference!
    }
}
```

✅ **GOOD - Break circular references in destroy**

```javascript
class Parent {
    destroy() {
        if (this.child) {
            this.child.destroy();
            this.child = null;
        }
    }
}

class Child {
    destroy() {
        this.parent = null; // Break circular reference
    }
}
```

## 📊 Monitoring in Production

For production deployments, consider adding:

```javascript
class MemoryMonitor {
    static checkForLeaks() {
        if (performance.memory) {
            const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
            const usage = usedJSHeapSize / jsHeapSizeLimit;

            if (usage > 0.9) {
                console.warn('High memory usage detected:', {
                    used: (usedJSHeapSize / 1048576).toFixed(2) + 'MB',
                    limit: (jsHeapSizeLimit / 1048576).toFixed(2) + 'MB',
                    percentage: (usage * 100).toFixed(2) + '%',
                });
            }
        }
    }
}

// Check every 30 seconds
setInterval(() => MemoryMonitor.checkForLeaks(), 30000);
```

## 🎓 Further Reading

- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [Chrome DevTools Memory Profiling](https://developer.chrome.com/docs/devtools/memory-problems/)
- [JavaScript Memory Leaks](https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/)

## ✅ Code Review Checklist

When reviewing PRs, verify:

- [ ] All `setTimeout`/`setInterval` calls are tracked and cleared
- [ ] All `requestAnimationFrame` calls are tracked and cancelled
- [ ] All event listeners are properly removed
- [ ] New classes have `destroy()` methods
- [ ] `destroy()` is called in parent component cleanup
- [ ] No circular references without cleanup
- [ ] Array pools and object pools are properly released

---

**Last Updated**: 2025-01-23 **Maintained By**: Emotive Engine Team
