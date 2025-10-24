# Component Cleanup Checklist

Use this checklist when creating or modifying components to ensure proper
resource management.

## ✅ Pre-Development

- [ ] Review [MEMORY_LEAK_PREVENTION.md](../MEMORY_LEAK_PREVENTION.md)
      guidelines
- [ ] Identify all resources the component will manage:
    - [ ] Timers (setTimeout/setInterval)
    - [ ] Animation frames (requestAnimationFrame)
    - [ ] Event listeners
    - [ ] DOM elements
    - [ ] WebGL/Canvas contexts
    - [ ] Web APIs (Battery, Geolocation, etc.)
    - [ ] Network connections (WebSocket, EventSource)
    - [ ] Media resources (Audio, Video)

## ✅ During Development

### Constructor Setup

- [ ] Initialize tracking properties for all resources:
    ```javascript
    this.rafId = null;
    this.timeouts = new Set();
    this.intervals = new Set();
    this.boundHandlers = new Map();
    this.eventListeners = new Map();
    ```

### Resource Creation

- [ ] **Timers**: Track every setTimeout/setInterval

    ```javascript
    const id = setTimeout(() => {...}, 1000);
    this.timeouts.add(id);
    ```

- [ ] **Animation Frames**: Track every requestAnimationFrame

    ```javascript
    this.rafId = requestAnimationFrame(() => this.animate());
    ```

- [ ] **Event Listeners**: Use bound handlers
    ```javascript
    this.boundHandler = this.handler.bind(this);
    element.addEventListener('event', this.boundHandler);
    this.eventListeners.set(element, this.boundHandler);
    ```

### Cleanup Implementation

- [ ] Implement `destroy()` method
- [ ] Clear all timers:
    ```javascript
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();
    ```
- [ ] Cancel all animation frames:
    ```javascript
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
    ```
- [ ] Remove all event listeners:
    ```javascript
    this.eventListeners.forEach((handler, element) => {
        element.removeEventListener('event', handler);
    });
    this.eventListeners.clear();
    ```
- [ ] Nullify object references:
    ```javascript
    this.cache = null;
    this.data = null;
    ```

## ✅ Testing

### Manual Testing

- [ ] Create component instance
- [ ] Activate all features
- [ ] Call `destroy()`
- [ ] Verify in console:
    - [ ] No errors thrown
    - [ ] No timers still running
    - [ ] No event listeners attached

### Browser DevTools Testing

- [ ] Open Chrome DevTools > Memory
- [ ] Take heap snapshot (Snapshot 1)
- [ ] Create 100 instances of component
- [ ] Destroy all instances
- [ ] Force garbage collection (trash icon)
- [ ] Take heap snapshot (Snapshot 2)
- [ ] Compare snapshots:
    - [ ] No significant memory increase
    - [ ] No detached DOM trees
    - [ ] Component instances are collected

### Automated Testing

- [ ] Add destroy() test:

    ```javascript
    it('cleans up all resources', () => {
        const component = new MyComponent();
        component.init();
        component.destroy();

        expect(component.rafId).toBeNull();
        expect(component.timeouts.size).toBe(0);
        expect(component.eventListeners.size).toBe(0);
    });
    ```

## ✅ Code Review

### Self Review

- [ ] Search for all `setTimeout` - are they tracked?
- [ ] Search for all `setInterval` - are they tracked?
- [ ] Search for all `requestAnimationFrame` - are they tracked?
- [ ] Search for all `addEventListener` - are they removed?
- [ ] Does `destroy()` clean up EVERYTHING?
- [ ] Are there any circular references?
- [ ] Are child components also destroyed?

### Peer Review Points

- [ ] Request reviewer to check memory management
- [ ] Provide before/after heap snapshots if significant changes
- [ ] Document any intentional long-lived resources

## ✅ Integration

### Parent Component Integration

- [ ] Parent calls `child.destroy()` in its own `destroy()`
- [ ] Parent nullifies child reference after destroy
- [ ] Parent handles component lifecycle correctly

### Documentation

- [ ] Document cleanup requirements in component JSDoc
- [ ] Note any special cleanup order requirements
- [ ] Document any resources NOT cleaned up (with justification)

## 🚨 Common Issues Checklist

- [ ] **Issue**: setTimeout without clearTimeout
    - **Fix**: Track timeout ID, clear in destroy()

- [ ] **Issue**: RAF loop doesn't stop
    - **Fix**: Track RAF ID, cancel in destroy()

- [ ] **Issue**: Event listener uses arrow function
    - **Fix**: Use bound method stored as property

- [ ] **Issue**: Interval continues after destroy
    - **Fix**: Track interval ID, clear in destroy()

- [ ] **Issue**: Child components not destroyed
    - **Fix**: Call child.destroy() before nullifying

- [ ] **Issue**: Circular reference prevents GC
    - **Fix**: Break references in destroy()

- [ ] **Issue**: Multiple destroy() calls cause errors
    - **Fix**: Guard with null checks, set to null after cleanup

## 📋 Quick Reference

```javascript
// TEMPLATE: Component with proper cleanup
class ProperComponent {
    constructor() {
        // Track resources
        this.rafId = null;
        this.timeouts = new Set();
        this.intervals = new Set();
        this.boundHandlers = new Map();

        // Bind methods
        this.boundUpdate = this.update.bind(this);
    }

    init() {
        // Setup listeners
        window.addEventListener('resize', this.boundUpdate);

        // Start animation
        this.rafId = requestAnimationFrame(() => this.animate());
    }

    addTimeout(callback, delay) {
        const id = setTimeout(() => {
            callback();
            this.timeouts.delete(id);
        }, delay);
        this.timeouts.add(id);
    }

    destroy() {
        // Cancel RAF
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Clear timers
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts.clear();

        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();

        // Remove listeners
        window.removeEventListener('resize', this.boundUpdate);

        // Nullify references
        this.data = null;
        this.cache = null;
    }
}
```

---

**Version**: 1.0.0 **Last Updated**: 2025-01-23 **Related**:
[MEMORY_LEAK_PREVENTION.md](../MEMORY_LEAK_PREVENTION.md)
