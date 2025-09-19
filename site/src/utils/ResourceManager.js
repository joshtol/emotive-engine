/**
 * Resource Manager
 * Tracks and manages resources to prevent memory leaks
 * @module utils/ResourceManager
 */

import { errorHandler, EngineError, ErrorCodes } from './ErrorHandler.js';

/**
 * Resource types
 * @enum {string}
 */
export const ResourceType = {
    ANIMATION: 'animation',
    TIMER: 'timer',
    LISTENER: 'listener',
    TEXTURE: 'texture',
    AUDIO: 'audio',
    PARTICLE: 'particle',
    CANVAS: 'canvas',
    WORKER: 'worker',
    STREAM: 'stream'
};

/**
 * Resource states
 * @enum {string}
 */
export const ResourceState = {
    IDLE: 'idle',
    ACTIVE: 'active',
    PAUSED: 'paused',
    DISPOSED: 'disposed'
};

/**
 * Resource entry
 * @class
 */
class Resource {
    constructor(id, type, reference, cleanup) {
        this.id = id;
        this.type = type;
        this.reference = reference;
        this.cleanup = cleanup;
        this.state = ResourceState.IDLE;
        this.createdAt = Date.now();
        this.lastAccessed = Date.now();
        this.accessCount = 0;
        this.metadata = {};
    }

    /**
     * Access the resource
     */
    access() {
        this.lastAccessed = Date.now();
        this.accessCount++;
        this.state = ResourceState.ACTIVE;
    }

    /**
     * Dispose of the resource
     */
    dispose() {
        if (this.state === ResourceState.DISPOSED) {
            return;
        }

        if (this.cleanup && typeof this.cleanup === 'function') {
            try {
                this.cleanup(this.reference);
            } catch (error) {
                console.error(`Failed to cleanup resource ${this.id}:`, error);
            }
        }

        this.reference = null;
        this.state = ResourceState.DISPOSED;
    }

    /**
     * Get resource age in milliseconds
     */
    getAge() {
        return Date.now() - this.createdAt;
    }

    /**
     * Get time since last access in milliseconds
     */
    getIdleTime() {
        return Date.now() - this.lastAccessed;
    }
}

/**
 * Resource Manager class
 */
export class ResourceManager {
    constructor(options = {}) {
        // Configuration
        this.config = {
            maxResources: options.maxResources || 1000,
            maxResourceAge: options.maxResourceAge || 300000, // 5 minutes
            maxIdleTime: options.maxIdleTime || 60000, // 1 minute
            gcInterval: options.gcInterval || 30000, // 30 seconds
            warnThreshold: options.warnThreshold || 0.8, // 80% of max
            autoGC: options.autoGC !== false,
            trackListeners: options.trackListeners !== false
        };

        // Resource storage
        this.resources = new Map();
        this.resourcesByType = new Map();

        // Statistics
        this.stats = {
            created: 0,
            disposed: 0,
            active: 0,
            leaks: 0
        };

        // Garbage collection
        this.gcTimer = null;
        this.lastGC = Date.now();

        // Listener tracking
        this.listenerTracking = new WeakMap();
        this.originalAddEventListener = null;
        this.originalRemoveEventListener = null;

        // Start auto GC if enabled
        if (this.config.autoGC) {
            this.startAutoGC();
        }

        // Setup listener tracking if enabled
        if (this.config.trackListeners) {
            this.setupListenerTracking();
        }
    }

    /**
     * Register a resource
     * @param {string} type - Resource type
     * @param {*} reference - Resource reference
     * @param {Function} [cleanup] - Cleanup function
     * @returns {string} Resource ID
     */
    register(type, reference, cleanup) {
        const id = this.generateId();
        const resource = new Resource(id, type, reference, cleanup);

        // Store resource
        this.resources.set(id, resource);

        // Store by type
        if (!this.resourcesByType.has(type)) {
            this.resourcesByType.set(type, new Set());
        }
        this.resourcesByType.get(type).add(id);

        // Update stats
        this.stats.created++;
        this.stats.active = this.resources.size;

        // Check limits
        this.checkLimits();

        return id;
    }

    /**
     * Register an animation frame
     * @param {number} animationId - Animation frame ID
     * @returns {string} Resource ID
     */
    registerAnimation(animationId) {
        return this.register(ResourceType.ANIMATION, animationId, (id) => {
            if (typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(id);
            }
        });
    }

    /**
     * Register a timer
     * @param {number} timerId - Timer ID
     * @param {string} timerType - 'timeout' or 'interval'
     * @returns {string} Resource ID
     */
    registerTimer(timerId, timerType = 'timeout') {
        return this.register(ResourceType.TIMER, timerId, (id) => {
            if (timerType === 'timeout') {
                clearTimeout(id);
            } else {
                clearInterval(id);
            }
        });
    }

    /**
     * Register an event listener
     * @param {EventTarget} target - Event target
     * @param {string} type - Event type
     * @param {Function} listener - Event listener
     * @param {Object} [options] - Listener options
     * @returns {string} Resource ID
     */
    registerListener(target, type, listener, options) {
        const listenerInfo = { target, type, listener, options };
        return this.register(ResourceType.LISTENER, listenerInfo, (info) => {
            if (info.target && typeof info.target.removeEventListener === 'function') {
                info.target.removeEventListener(info.type, info.listener, info.options);
            }
        });
    }

    /**
     * Register an audio context or buffer
     * @param {AudioContext|AudioBuffer} audio - Audio resource
     * @returns {string} Resource ID
     */
    registerAudio(audio) {
        return this.register(ResourceType.AUDIO, audio, (audioResource) => {
            if (audioResource && typeof audioResource.close === 'function') {
                audioResource.close();
            }
        });
    }

    /**
     * Get a resource
     * @param {string} id - Resource ID
     * @returns {*} Resource reference or null
     */
    get(id) {
        const resource = this.resources.get(id);
        if (resource && resource.state !== ResourceState.DISPOSED) {
            resource.access();
            return resource.reference;
        }
        return null;
    }

    /**
     * Release a resource
     * @param {string} id - Resource ID
     */
    release(id) {
        const resource = this.resources.get(id);
        if (resource) {
            resource.dispose();
            this.resources.delete(id);

            // Remove from type map
            const typeSet = this.resourcesByType.get(resource.type);
            if (typeSet) {
                typeSet.delete(id);
            }

            // Update stats
            this.stats.disposed++;
            this.stats.active = this.resources.size;
        }
    }

    /**
     * Release all resources of a type
     * @param {string} type - Resource type
     */
    releaseByType(type) {
        const typeSet = this.resourcesByType.get(type);
        if (typeSet) {
            const ids = Array.from(typeSet);
            ids.forEach(id => this.release(id));
        }
    }

    /**
     * Release all resources
     */
    releaseAll() {
        const ids = Array.from(this.resources.keys());
        ids.forEach(id => this.release(id));
    }

    /**
     * Generate unique ID
     * @private
     */
    generateId() {
        return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check resource limits
     * @private
     */
    checkLimits() {
        const count = this.resources.size;
        const threshold = this.config.maxResources * this.config.warnThreshold;

        if (count > this.config.maxResources) {
            // Force garbage collection
            this.collectGarbage(true);

            // If still over limit, release oldest
            if (this.resources.size > this.config.maxResources) {
                this.releaseOldest(this.resources.size - this.config.maxResources);
            }
        } else if (count > threshold) {
            if (window.DEBUG) {
                console.warn(`Resource count high: ${count}/${this.config.maxResources}`);
            }
        }
    }

    /**
     * Release oldest resources
     * @private
     */
    releaseOldest(count) {
        const sorted = Array.from(this.resources.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

        for (let i = 0; i < Math.min(count, sorted.length); i++) {
            this.release(sorted[i][0]);
        }
    }

    /**
     * Collect garbage (release idle/old resources)
     * @param {boolean} [force] - Force collection regardless of idle time
     */
    collectGarbage(force = false) {
        const now = Date.now();
        const collected = [];

        this.resources.forEach((resource, id) => {
            const age = resource.getAge();
            const idle = resource.getIdleTime();

            // Check if resource should be collected
            if (force ||
                age > this.config.maxResourceAge ||
                idle > this.config.maxIdleTime) {
                collected.push(id);
            }
        });

        // Release collected resources
        collected.forEach(id => {
            this.release(id);
            this.stats.leaks++;
        });

        this.lastGC = now;

        if (window.DEBUG && collected.length > 0) {
            console.log(`[ResourceManager] Collected ${collected.length} resources`);
        }

        return collected.length;
    }

    /**
     * Start automatic garbage collection
     * @private
     */
    startAutoGC() {
        if (this.gcTimer) {
            return;
        }

        this.gcTimer = setInterval(() => {
            this.collectGarbage();
        }, this.config.gcInterval);
    }

    /**
     * Stop automatic garbage collection
     */
    stopAutoGC() {
        if (this.gcTimer) {
            clearInterval(this.gcTimer);
            this.gcTimer = null;
        }
    }

    /**
     * Setup event listener tracking
     * @private
     */
    setupListenerTracking() {
        if (typeof EventTarget === 'undefined') {
            return;
        }

        // Store original methods
        this.originalAddEventListener = EventTarget.prototype.addEventListener;
        this.originalRemoveEventListener = EventTarget.prototype.removeEventListener;

        const manager = this;

        // Override addEventListener
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Call original
            manager.originalAddEventListener.call(this, type, listener, options);

            // Track listener
            if (!manager.listenerTracking.has(this)) {
                manager.listenerTracking.set(this, new Map());
            }
            const listeners = manager.listenerTracking.get(this);
            const key = `${type}:${listener.toString()}`;

            if (!listeners.has(key)) {
                const resourceId = manager.registerListener(this, type, listener, options);
                listeners.set(key, resourceId);
            }
        };

        // Override removeEventListener
        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            // Call original
            manager.originalRemoveEventListener.call(this, type, listener, options);

            // Untrack listener
            const listeners = manager.listenerTracking.get(this);
            if (listeners) {
                const key = `${type}:${listener.toString()}`;
                const resourceId = listeners.get(key);
                if (resourceId) {
                    manager.release(resourceId);
                    listeners.delete(key);
                }
            }
        };
    }

    /**
     * Restore original event listener methods
     */
    restoreListenerMethods() {
        if (this.originalAddEventListener && typeof EventTarget !== 'undefined') {
            EventTarget.prototype.addEventListener = this.originalAddEventListener;
            EventTarget.prototype.removeEventListener = this.originalRemoveEventListener;
        }
    }

    /**
     * Get resource statistics
     * @returns {Object} Resource statistics
     */
    getStats() {
        const stats = { ...this.stats };

        // Add type breakdown
        stats.byType = {};
        this.resourcesByType.forEach((set, type) => {
            stats.byType[type] = set.size;
        });

        // Add age statistics
        let totalAge = 0;
        let maxAge = 0;
        let totalIdle = 0;
        let maxIdle = 0;

        this.resources.forEach(resource => {
            const age = resource.getAge();
            const idle = resource.getIdleTime();

            totalAge += age;
            maxAge = Math.max(maxAge, age);
            totalIdle += idle;
            maxIdle = Math.max(maxIdle, idle);
        });

        if (this.resources.size > 0) {
            stats.avgAge = Math.round(totalAge / this.resources.size);
            stats.maxAge = maxAge;
            stats.avgIdle = Math.round(totalIdle / this.resources.size);
            stats.maxIdle = maxIdle;
        }

        stats.lastGC = Date.now() - this.lastGC;

        return stats;
    }

    /**
     * Get memory usage estimate
     * @returns {Object} Memory usage estimate
     */
    getMemoryUsage() {
        const usage = {
            resources: this.resources.size,
            estimated: 0
        };

        // Rough estimates per resource type
        const estimates = {
            [ResourceType.ANIMATION]: 100,      // bytes
            [ResourceType.TIMER]: 100,
            [ResourceType.LISTENER]: 500,
            [ResourceType.TEXTURE]: 100000,     // 100KB average
            [ResourceType.AUDIO]: 1000000,      // 1MB average
            [ResourceType.PARTICLE]: 1000,
            [ResourceType.CANVAS]: 500000,      // 500KB average
            [ResourceType.WORKER]: 50000,
            [ResourceType.STREAM]: 10000
        };

        this.resourcesByType.forEach((set, type) => {
            const estimate = estimates[type] || 1000;
            usage.estimated += set.size * estimate;
        });

        usage.estimatedMB = (usage.estimated / 1048576).toFixed(2);

        return usage;
    }

    /**
     * Create a scoped resource manager
     * @param {string} scope - Scope name
     * @returns {Object} Scoped manager
     */
    createScope(scope) {
        const scopedIds = new Set();

        return {
            register: (type, reference, cleanup) => {
                const id = this.register(type, reference, cleanup);
                scopedIds.add(id);
                return id;
            },
            release: (id) => {
                if (scopedIds.has(id)) {
                    this.release(id);
                    scopedIds.delete(id);
                }
            },
            releaseAll: () => {
                scopedIds.forEach(id => this.release(id));
                scopedIds.clear();
            },
            getCount: () => scopedIds.size
        };
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Stop auto GC
        this.stopAutoGC();

        // Release all resources
        this.releaseAll();

        // Restore listener methods
        this.restoreListenerMethods();

        // Clear tracking
        this.resources.clear();
        this.resourcesByType.clear();
    }
}

// Create singleton instance
export const resourceManager = new ResourceManager({
    autoGC: true,
    trackListeners: false // Disabled by default for performance
});

// Export default
export default resourceManager;

// Make available globally for debugging
if (typeof window !== 'undefined' && window.DEBUG) {
    window.resourceManager = resourceManager;
}