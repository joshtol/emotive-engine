/**
 * State Store
 * Centralized state management for the Emotive Engine
 *
 * @module core/StateStore
 * @version 1.0.0
 */

/**
 * Observable state store with immutable updates
 */
export class StateStore {
    constructor(initialState = {}) {
        // The actual state object (private)
        this._state = this.deepClone(initialState);

        // Previous state for comparison
        this._prevState = this.deepClone(initialState);

        // Subscribers for state changes
        this._subscribers = new Map();

        // State change history for debugging
        this._history = [];
        this._maxHistorySize = 50;

        // Middleware functions
        this._middleware = [];

        // State validation rules
        this._validators = new Map();

        // Computed values cache
        this._computed = new Map();
        this._computedDeps = new Map();

        // Performance tracking
        this._stats = {
            updates: 0,
            notifications: 0,
            computedCacheHits: 0,
            computedCacheMisses: 0
        };
    }

    /**
     * Get current state or a specific path
     * @param {string} path - Optional dot-notation path (e.g., 'renderer.color')
     * @returns {*} State value
     */
    getState(path = null) {
        if (!path) {
            return this.deepClone(this._state);
        }

        return this.deepClone(this.getNestedValue(this._state, path));
    }

    /**
     * Set state with immutable update
     * @param {string|Object} pathOrUpdates - Path or object with updates
     * @param {*} value - Value if path is provided
     * @returns {boolean} Success status
     */
    setState(pathOrUpdates, value = undefined) {
        let updates;

        // Handle both setState('path', value) and setState({updates})
        if (typeof pathOrUpdates === 'string') {
            updates = { [pathOrUpdates]: value };
        } else {
            updates = pathOrUpdates;
        }

        // Apply middleware
        for (const middleware of this._middleware) {
            updates = middleware(updates, this._state);
            if (!updates) return false; // Middleware can cancel update
        }

        // Create new state
        const newState = this.deepClone(this._state);

        // Apply updates
        for (const [path, val] of Object.entries(updates)) {
            // Validate update
            if (this._validators.has(path)) {
                const validator = this._validators.get(path);
                if (!validator(val)) {
                    console.error(`Validation failed for path: ${path}`);
                    return false;
                }
            }

            this.setNestedValue(newState, path, val);
        }

        // Store previous state
        this._prevState = this._state;
        this._state = newState;

        // Add to history
        this.addToHistory(updates);

        // Invalidate computed values that depend on changed paths
        this.invalidateComputed(Object.keys(updates));

        // Notify subscribers
        this.notifySubscribers(updates);

        // Update stats
        this._stats.updates++;

        return true;
    }

    /**
     * Subscribe to state changes
     * @param {string|Function} pathOrCallback - Path to watch or callback for all changes
     * @param {Function} callback - Callback if path is provided
     * @returns {Function} Unsubscribe function
     */
    subscribe(pathOrCallback, callback = null) {
        let path = null;
        let cb = pathOrCallback;

        if (typeof pathOrCallback === 'string') {
            path = pathOrCallback;
            cb = callback;
        }

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

    /**
     * Create computed value that auto-updates
     * @param {string} name - Computed value name
     * @param {Array} deps - Dependency paths
     * @param {Function} compute - Compute function
     */
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
                this._stats.computedCacheMisses++;
                const values = deps.map(dep => this.getState(dep));
                const result = compute(...values);

                // Cache result
                this._computed.set(name, result);

                return result;
            }
        });
    }

    /**
     * Add validation rule for a path
     * @param {string} path - State path
     * @param {Function} validator - Validation function
     */
    addValidator(path, validator) {
        this._validators.set(path, validator);
    }

    /**
     * Add middleware for state updates
     * @param {Function} middleware - Middleware function
     */
    addMiddleware(middleware) {
        this._middleware.push(middleware);
    }

    /**
     * Reset to initial state
     * @param {Object} initialState - New initial state
     */
    reset(initialState = {}) {
        this._state = this.deepClone(initialState);
        this._prevState = this.deepClone(initialState);
        this._history = [];
        this._computed.clear();
        this.notifySubscribers({ '*': 'reset' });
    }

    /**
     * Get state diff between current and previous
     * @returns {Object} Diff object
     */
    getDiff() {
        return this.objectDiff(this._prevState, this._state);
    }

    /**
     * Time travel to previous state
     * @param {number} steps - Number of steps back
     */
    undo(steps = 1) {
        if (this._history.length < steps) {
            console.warn('Cannot undo: insufficient history');
            return false;
        }

        // Get state from history
        const targetIndex = Math.max(0, this._history.length - steps - 1);
        const targetEntry = this._history[targetIndex];

        if (targetEntry) {
            this._state = this.deepClone(targetEntry.state);
            this._history = this._history.slice(0, targetIndex + 1);
            this.notifySubscribers({ '*': 'undo' });
            return true;
        }

        return false;
    }

    /**
     * Batch multiple updates
     * @param {Function} updateFn - Function with multiple setState calls
     */
    batch(updateFn) {
        const updates = {};

        // Temporarily override setState to collect updates
        const originalSetState = this.setState.bind(this);
        this.setState = (path, value) => {
            if (typeof path === 'string') {
                updates[path] = value;
            } else {
                Object.assign(updates, path);
            }
            return true;
        };

        // Execute update function
        updateFn();

        // Restore original setState
        this.setState = originalSetState;

        // Apply all updates at once
        return this.setState(updates);
    }

    /**
     * Create a selector for derived state
     * @param {Function} selector - Selector function
     * @returns {Function} Memoized selector
     */
    createSelector(selector) {
        let lastState = null;
        let lastResult = null;

        return () => {
            const currentState = this._state;
            if (currentState === lastState) {
                return lastResult;
            }

            lastState = currentState;
            lastResult = selector(currentState);
            return lastResult;
        };
    }

    // Private helper methods

    /**
     * Notify subscribers of state changes
     * @private
     */
    notifySubscribers(updates) {
        for (const subscriber of this._subscribers.values()) {
            // Check if subscriber cares about these updates
            if (!subscriber.path || Object.keys(updates).some(path =>
                path.startsWith(subscriber.path) || subscriber.path.startsWith(path)
            )) {
                subscriber.callback(this._state, updates);
                this._stats.notifications++;
            }
        }
    }

    /**
     * Invalidate computed values
     * @private
     */
    invalidateComputed(changedPaths) {
        for (const [name, deps] of this._computedDeps.entries()) {
            if (deps.some(dep => changedPaths.some(path =>
                dep.startsWith(path) || path.startsWith(dep)
            ))) {
                this._computed.delete(name);
            }
        }
    }

    /**
     * Add to history
     * @private
     */
    addToHistory(updates) {
        this._history.push({
            timestamp: Date.now(),
            updates,
            state: this.deepClone(this._state)
        });

        // Limit history size
        if (this._history.length > this._maxHistorySize) {
            this._history.shift();
        }
    }

    /**
     * Deep clone an object
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Get nested value from object
     * @private
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) =>
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }

    /**
     * Set nested value in object
     * @private
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Get object diff
     * @private
     */
    objectDiff(oldObj, newObj) {
        const diff = {};

        // Check for additions and changes
        for (const key in newObj) {
            if (!(key in oldObj)) {
                diff[key] = { type: 'added', value: newObj[key] };
            } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                diff[key] = {
                    type: 'changed',
                    oldValue: oldObj[key],
                    newValue: newObj[key]
                };
            }
        }

        // Check for deletions
        for (const key in oldObj) {
            if (!(key in newObj)) {
                diff[key] = { type: 'deleted', oldValue: oldObj[key] };
            }
        }

        return diff;
    }

    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            ...this._stats,
            subscribers: this._subscribers.size,
            historySize: this._history.length,
            computedValues: this._computed.size,
            validators: this._validators.size
        };
    }
}

// Create singleton instance for the engine
export const engineState = new StateStore({
    // Core engine state
    engine: {
        initialized: false,
        running: false,
        paused: false,
        fps: 60,
        frameCount: 0
    },

    // Renderer state
    renderer: {
        color: '#4a90e2',
        intensity: 1.0,
        eyeOpenness: 1.0,
        breathRate: 1.0,
        breathDepth: 1.0,
        sleeping: false,
        zenMode: false
    },

    // Animation state
    animation: {
        currentGesture: null,
        gestureQueue: [],
        activeLoops: 0
    },

    // Emotion state
    emotion: {
        current: 'neutral',
        intensity: 1.0,
        undertone: null,
        transitioning: false
    },

    // Particle state
    particles: {
        active: true,
        count: 0,
        maxParticles: 100
    },

    // Sound state
    sound: {
        enabled: false,
        volume: 1.0,
        bpm: 120,
        rhythmEnabled: false
    },

    // Performance state
    performance: {
        quality: 'high',
        adaptiveQuality: true,
        targetFPS: 60,
        actualFPS: 60
    }
});

// Export for convenience
export default engineState;