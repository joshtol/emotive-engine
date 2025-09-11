/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝                                                                             
 *                       ◐ ◑ ◒ ◓  EVENT MANAGER  ◓ ◒ ◑ ◐                       
 *                                                                                    
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Event Manager - Centralized Event System & Memory Management
 * @author Emotive Engine Team
 * @version 2.0.0
 * @module EventManager
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE                                         
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ The NERVOUS SYSTEM of the engine. Manages all event listeners with proper         
 * ║ cleanup to prevent memory leaks. Centralizes event handling for DOM events,       
 * ║ custom events, and ensures everything is properly disposed when destroyed.        
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📡 EVENT FEATURES                                                                  
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Centralized listener registration                                               
 * │ • Automatic cleanup on destroy                                                    
 * │ • Memory leak prevention                                                          
 * │ • Event delegation support                                                        
 * │ • Custom event emitter pattern                                                    
 * │ • Throttled and debounced events                                                  
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

class EventManager {
    constructor(config = {}) {
        // Event storage
        this.listeners = new Map();
        this.onceListeners = new Set();
        
        // Configuration
        this.maxListeners = config.maxListeners || 100;
        this.enableDebugging = config.enableDebugging || false;
        this.enableMonitoring = config.enableMonitoring || false;
        
        // Memory management
        this.totalListenerCount = 0;
        this.listenerHistory = [];
        this.memoryWarningThreshold = config.memoryWarningThreshold || 50;
        
        // Debugging and monitoring
        this.eventStats = new Map();
        this.isDestroyed = false;
        
        // Bind methods for proper context
        this.cleanup = this.cleanup.bind(this);
        
        if (this.enableDebugging) {
            // EventManager initialized with debugging enabled
        }
    }

    /**
     * Adds an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {boolean} Success status
     */
    on(event, callback) {
        if (this.isDestroyed) {
            // Cannot add listener to destroyed EventManager
            return false;
        }

        // Validate inputs
        const validation = this.validateEvent(event, callback);
        if (!validation.isValid) {
            // Validation error
            return false;
        }

        // Check listener limits
        if (this.totalListenerCount >= this.maxListeners) {
            // Maximum listener limit reached
            return false;
        }

        // Initialize event array if needed
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
            this.eventStats.set(event, {
                listenerCount: 0,
                emitCount: 0,
                lastEmit: null,
                created: Date.now()
            });
        }

        // Add listener
        const listeners = this.listeners.get(event);
        listeners.push(callback);
        this.totalListenerCount++;

        // Update statistics
        const stats = this.eventStats.get(event);
        stats.listenerCount = listeners.length;

        // Memory monitoring
        if (this.enableMonitoring) {
            this.checkMemoryUsage();
        }

        // Debugging
        if (this.enableDebugging) {
            // Added listener
        }

        // Emit internal event for monitoring
        this.emitInternal('listenerAdded', { 
            event, 
            listenerCount: listeners.length,
            totalListeners: this.totalListenerCount
        });

        return true;
    }

    /**
     * Removes a specific event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function to remove
     * @returns {boolean} Success status
     */
    off(event, callback) {
        if (this.isDestroyed) {
            // Cannot remove listener from destroyed EventManager
            return false;
        }

        if (!this.listeners.has(event)) {
            return false;
        }

        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        
        if (index === -1) {
            return false;
        }

        // Remove listener
        listeners.splice(index, 1);
        this.totalListenerCount--;

        // Remove once listener tracking if applicable
        this.onceListeners.delete(callback);

        // Clean up empty event arrays
        if (listeners.length === 0) {
            this.listeners.delete(event);
            this.eventStats.delete(event);
        } else {
            // Update statistics
            const stats = this.eventStats.get(event);
            stats.listenerCount = listeners.length;
        }

        // Debugging
        if (this.enableDebugging) {
            // Removed listener
        }

        // Emit internal event for monitoring
        this.emitInternal('listenerRemoved', { 
            event, 
            listenerCount: listeners.length,
            totalListeners: this.totalListenerCount
        });

        return true;
    }

    /**
     * Adds a one-time event listener that removes itself after first execution
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {boolean} Success status
     */
    once(event, callback) {
        if (this.isDestroyed) {
            // Cannot add once listener to destroyed EventManager
            return false;
        }

        // Create wrapper function that removes itself
        const onceWrapper = (data) => {
            try {
                callback(data);
            } finally {
                // Always remove the listener, even if callback throws
                this.off(event, onceWrapper);
            }
        };

        // Track this as a once listener for cleanup
        this.onceListeners.add(onceWrapper);

        // Add the wrapper as a regular listener
        const success = this.on(event, onceWrapper);

        if (this.enableDebugging && success) {
            // Added once listener
        }

        return success;
    }

    /**
     * Emits an event to all registered listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {number} Number of listeners that received the event
     */
    emit(event, data = null) {
        if (this.isDestroyed) {
            return 0;
        }

        if (!this.listeners.has(event)) {
            return 0;
        }

        const listeners = this.listeners.get(event);
        let successCount = 0;

        // Update statistics
        const stats = this.eventStats.get(event);
        stats.emitCount++;
        stats.lastEmit = Date.now();

        // Execute all listeners with error protection
        for (const callback of [...listeners]) { // Copy array to handle modifications during iteration
            try {
                callback(data);
                successCount++;
            } catch (error) {
                // Error in listener
                
                // Emit error event for monitoring
                this.emitInternal('listenerError', {
                    event,
                    error: error.message,
                    stack: error.stack
                });
            }
        }

        // Debugging
        if (this.enableDebugging) {
            // Emitted event to listeners
        }

        return successCount;
    }

    /**
     * Removes all listeners for a specific event or all events
     * @param {string|null} event - Event name to clear, or null to clear all
     * @returns {number} Number of listeners removed
     */
    removeAllListeners(event = null) {
        if (this.isDestroyed) {
            return 0;
        }

        let removedCount = 0;

        if (event === null) {
            // Clear all listeners
            for (const [eventName, listeners] of this.listeners) {
                removedCount += listeners.length;
            }
            
            this.listeners.clear();
            this.eventStats.clear();
            this.onceListeners.clear();
            this.totalListenerCount = 0;

            if (this.enableDebugging) {
                // Cleared all event listeners
            }
        } else if (this.listeners.has(event)) {
            // Clear listeners for specific event
            const listeners = this.listeners.get(event);
            removedCount = listeners.length;
            
            // Remove once listener tracking for this event
            for (const listener of listeners) {
                this.onceListeners.delete(listener);
            }
            
            this.listeners.delete(event);
            this.eventStats.delete(event);
            this.totalListenerCount -= removedCount;

            if (this.enableDebugging) {
                // Cleared listeners for event
            }
        }

        // Emit internal event for monitoring
        if (removedCount > 0) {
            this.emitInternal('listenersCleared', { 
                event, 
                removedCount,
                totalListeners: this.totalListenerCount
            });
        }

        return removedCount;
    }

    /**
     * Gets the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }

    /**
     * Gets all registered event names
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Gets comprehensive event statistics
     * @returns {Object} Event statistics and monitoring data
     */
    getEventStats() {
        const stats = {
            totalListeners: this.totalListenerCount,
            totalEvents: this.listeners.size,
            onceListeners: this.onceListeners.size,
            events: {}
        };

        for (const [event, eventStats] of this.eventStats) {
            stats.events[event] = {
                ...eventStats,
                currentListeners: this.listenerCount(event)
            };
        }

        return stats;
    }

    /**
     * Validates event name and callback
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {Object} Validation result
     */
    validateEvent(event, callback) {
        if (typeof event !== 'string' || !event.trim()) {
            return {
                isValid: false,
                error: 'Event name must be a non-empty string'
            };
        }

        if (typeof callback !== 'function') {
            return {
                isValid: false,
                error: 'Event callback must be a function'
            };
        }

        // Note: We allow external listeners for monitoring events like 'listenerAdded', etc.
        // These are useful for debugging and monitoring purposes

        return { isValid: true };
    }

    /**
     * Checks memory usage and emits warnings if thresholds are exceeded
     */
    checkMemoryUsage() {
        if (this.totalListenerCount > this.memoryWarningThreshold) {
            // High listener count detected
            
            this.emitInternal('memoryWarning', {
                totalListeners: this.totalListenerCount,
                maxListeners: this.maxListeners,
                threshold: this.memoryWarningThreshold
            });
        }

        // Track listener history for leak detection
        this.listenerHistory.push({
            timestamp: Date.now(),
            count: this.totalListenerCount
        });

        // Keep only recent history (last 100 entries)
        if (this.listenerHistory.length > 100) {
            this.listenerHistory.shift();
        }
    }

    /**
     * Detects potential memory leaks based on listener growth patterns
     * @returns {Object} Leak detection results
     */
    detectMemoryLeaks() {
        if (this.listenerHistory.length < 10) {
            return { hasLeak: false, reason: 'Insufficient data' };
        }

        const recent = this.listenerHistory.slice(-10);
        const growth = recent[recent.length - 1].count - recent[0].count;
        const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;

        // Check for rapid growth (more than 1 listener per 100ms)
        const growthRate = growth / (timeSpan / 1000);
        
        if (growthRate > 10) {
            return {
                hasLeak: true,
                reason: 'Rapid listener growth detected',
                growthRate,
                recommendation: 'Check for missing off() calls or cleanup in once() listeners'
            };
        }

        // Check for consistently high listener count
        const avgCount = recent.reduce((sum, entry) => sum + entry.count, 0) / recent.length;
        if (avgCount > this.memoryWarningThreshold * 0.8) {
            return {
                hasLeak: true,
                reason: 'Consistently high listener count',
                averageCount: avgCount,
                recommendation: 'Review listener lifecycle and cleanup patterns'
            };
        }

        return { hasLeak: false };
    }

    /**
     * Emits internal events for monitoring (prevents infinite recursion)
     * @param {string} event - Internal event name
     * @param {*} data - Event data
     */
    emitInternal(event, data) {
        // Only emit if there are external listeners and we're not destroyed
        if (!this.isDestroyed && this.listeners.has(event)) {
            // Use setTimeout to prevent recursion issues
            setTimeout(() => {
                if (!this.isDestroyed) {
                    this.emit(event, data);
                }
            }, 0);
        }
    }

    /**
     * Performs comprehensive cleanup of all resources
     */
    cleanup() {
        if (this.isDestroyed) {
            return;
        }

        const totalRemoved = this.totalListenerCount;

        // Clear all listeners and tracking
        this.listeners.clear();
        this.eventStats.clear();
        this.onceListeners.clear();
        this.listenerHistory = [];
        this.totalListenerCount = 0;

        if (this.enableDebugging) {
            // EventManager cleanup completed
        }
    }

    /**
     * Destroys the EventManager and prevents further use
     */
    destroy() {
        if (this.isDestroyed) {
            return;
        }

        this.cleanup();
        this.isDestroyed = true;

        if (this.enableDebugging) {
            // EventManager destroyed
        }
    }

    /**
     * Gets debugging information about the EventManager state
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            isDestroyed: this.isDestroyed,
            totalListeners: this.totalListenerCount,
            maxListeners: this.maxListeners,
            eventCount: this.listeners.size,
            onceListenerCount: this.onceListeners.size,
            memoryWarningThreshold: this.memoryWarningThreshold,
            enableDebugging: this.enableDebugging,
            enableMonitoring: this.enableMonitoring,
            events: this.getEventNames(),
            stats: this.getEventStats(),
            memoryLeakCheck: this.detectMemoryLeaks()
        };
    }
}

export default EventManager;