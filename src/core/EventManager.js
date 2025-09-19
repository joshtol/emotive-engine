/**
 * Event Manager
 * Centralized event listener management to prevent memory leaks
 *
 * @module core/EventManager
 * @version 1.0.0
 */

/**
 * Manages all event listeners to ensure proper cleanup
 */
export class EventManager {
    constructor() {
        // Track all registered listeners
        this.listeners = new Map();

        // Track listener groups for batch operations
        this.groups = new Map();

        // Auto-cleanup on page unload
        // Removed unload handler - not needed and causes violations

        // Stats
        this.stats = {
            registered: 0,
            removed: 0,
            active: 0
        };
    }

    /**
     * Register an event listener
     * @param {EventTarget} target - Event target (element, window, document, etc.)
     * @param {string} eventType - Event type (click, resize, etc.)
     * @param {Function} handler - Event handler function
     * @param {Object} options - addEventListener options
     * @param {string} group - Optional group name for batch operations
     * @returns {string} Listener ID for later removal
     */
    addEventListener(target, eventType, handler, options = {}, group = 'default') {
        // Generate unique ID
        const id = this.generateId();

        // Create listener info
        const listenerInfo = {
            id,
            target,
            eventType,
            handler,
            options,
            group,
            active: true
        };

        // Store listener
        this.listeners.set(id, listenerInfo);

        // Add to group
        if (!this.groups.has(group)) {
            this.groups.set(group, new Set());
        }
        this.groups.get(group).add(id);

        // Actually add the listener
        target.addEventListener(eventType, handler, options);

        // Update stats
        this.stats.registered++;
        this.stats.active++;

        return id;
    }

    /**
     * Remove an event listener by ID
     * @param {string} id - Listener ID
     * @returns {boolean} Success status
     */
    removeEventListener(id) {
        const listenerInfo = this.listeners.get(id);

        if (!listenerInfo || !listenerInfo.active) {
            return false;
        }

        // Remove the actual listener
        listenerInfo.target.removeEventListener(
            listenerInfo.eventType,
            listenerInfo.handler,
            listenerInfo.options
        );

        // Mark as inactive
        listenerInfo.active = false;

        // Remove from group
        const group = this.groups.get(listenerInfo.group);
        if (group) {
            group.delete(id);
            if (group.size === 0) {
                this.groups.delete(listenerInfo.group);
            }
        }

        // Remove from listeners map
        this.listeners.delete(id);

        // Update stats
        this.stats.removed++;
        this.stats.active--;

        return true;
    }

    /**
     * Remove all listeners in a group
     * @param {string} group - Group name
     * @returns {number} Number of listeners removed
     */
    removeGroup(group) {
        const groupSet = this.groups.get(group);

        if (!groupSet) {
            return 0;
        }

        let removed = 0;

        for (const id of groupSet) {
            if (this.removeEventListener(id)) {
                removed++;
            }
        }

        return removed;
    }

    /**
     * Remove all listeners for a specific target
     * @param {EventTarget} target - Event target
     * @returns {number} Number of listeners removed
     */
    removeAllForTarget(target) {
        let removed = 0;

        for (const [id, info] of this.listeners.entries()) {
            if (info.target === target && info.active) {
                if (this.removeEventListener(id)) {
                    removed++;
                }
            }
        }

        return removed;
    }

    /**
     * Remove all listeners of a specific type
     * @param {string} eventType - Event type
     * @returns {number} Number of listeners removed
     */
    removeAllOfType(eventType) {
        let removed = 0;

        for (const [id, info] of this.listeners.entries()) {
            if (info.eventType === eventType && info.active) {
                if (this.removeEventListener(id)) {
                    removed++;
                }
            }
        }

        return removed;
    }

    /**
     * Remove all listeners
     * @returns {number} Number of listeners removed
     */
    removeAll() {
        let removed = 0;

        for (const [id, info] of this.listeners.entries()) {
            if (info.active) {
                if (this.removeEventListener(id)) {
                    removed++;
                }
            }
        }

        return removed;
    }

    /**
     * Create a bound listener that auto-removes
     * @param {EventTarget} target - Event target
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Options
     * @returns {Object} Controller with remove method
     */
    createAutoRemove(target, eventType, handler, options = {}) {
        const id = this.addEventListener(target, eventType, handler, options);

        return {
            id,
            remove: () => this.removeEventListener(id)
        };
    }

    /**
     * Add listener that fires only once
     * @param {EventTarget} target - Event target
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Options
     * @returns {string} Listener ID
     */
    once(target, eventType, handler, options = {}) {
        const wrappedHandler = (event) => {
            handler(event);
            this.removeEventListener(id);
        };

        const id = this.addEventListener(target, eventType, wrappedHandler, options);

        return id;
    }

    /**
     * Debounced event listener
     * @param {EventTarget} target - Event target
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     * @param {number} delay - Debounce delay in ms
     * @param {Object} options - Options
     * @returns {string} Listener ID
     */
    debounced(target, eventType, handler, delay = 250, options = {}) {
        let timeoutId;

        const debouncedHandler = (event) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => handler(event), delay);
        };

        return this.addEventListener(target, eventType, debouncedHandler, options);
    }

    /**
     * Throttled event listener
     * @param {EventTarget} target - Event target
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     * @param {number} limit - Throttle limit in ms
     * @param {Object} options - Options
     * @returns {string} Listener ID
     */
    throttled(target, eventType, handler, limit = 100, options = {}) {
        let inThrottle = false;

        const throttledHandler = (event) => {
            if (!inThrottle) {
                handler(event);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };

        return this.addEventListener(target, eventType, throttledHandler, options);
    }

    // Removed setupUnloadHandler - causes permission violations
    // Browser automatically cleans up event listeners on unload

    /**
     * Generate unique ID
     * @private
     * @returns {string} Unique ID
     */
    generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            groups: this.groups.size,
            listeners: this.listeners.size
        };
    }

    /**
     * Get active listeners for debugging
     * @returns {Array} Active listener info
     */
    getActiveListeners() {
        const active = [];

        for (const [id, info] of this.listeners.entries()) {
            if (info.active) {
                active.push({
                    id,
                    eventType: info.eventType,
                    group: info.group,
                    target: info.target.constructor.name
                });
            }
        }

        return active;
    }

    /**
     * Check for potential memory leaks
     * @returns {Object} Leak analysis
     */
    analyzeLeaks() {
        const analysis = {
            totalListeners: this.listeners.size,
            activeListeners: this.stats.active,
            inactiveButNotRemoved: 0,
            byTarget: new Map(),
            byType: new Map(),
            potentialLeaks: []
        };

        for (const [id, info] of this.listeners.entries()) {
            // Count by target
            const targetName = info.target.constructor.name;
            analysis.byTarget.set(
                targetName,
                (analysis.byTarget.get(targetName) || 0) + 1
            );

            // Count by type
            analysis.byType.set(
                info.eventType,
                (analysis.byType.get(info.eventType) || 0) + 1
            );

            // Check for inactive but not removed
            if (!info.active) {
                analysis.inactiveButNotRemoved++;
                analysis.potentialLeaks.push({
                    id,
                    eventType: info.eventType,
                    target: targetName
                });
            }
        }

        // Convert maps to objects for easier reading
        analysis.byTarget = Object.fromEntries(analysis.byTarget);
        analysis.byType = Object.fromEntries(analysis.byType);

        return analysis;
    }

    /**
     * Clean up inactive listeners
     * @returns {number} Number cleaned
     */
    cleanup() {
        let cleaned = 0;

        for (const [id, info] of this.listeners.entries()) {
            if (!info.active) {
                this.listeners.delete(id);
                cleaned++;
            }
        }

        return cleaned;
    }
}

// Create singleton instance
export const eventManager = new EventManager();

// Export for convenience
export default eventManager;