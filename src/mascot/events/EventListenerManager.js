/**
 * EventListenerManager - Event Subscription and Lifecycle Manager
 *
 * Provides public API for event subscription, unsubscription, and event system
 * introspection. Wraps the internal EventManager with error boundaries.
 *
 * @module EventListenerManager
 */

export class EventListenerManager {
    /**
     * Create EventListenerManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.eventManager - Internal event emitter
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('EventListenerManager: errorBoundary required');
        if (!deps.eventManager) throw new Error('EventListenerManager: eventManager required');

        this.errorBoundary = deps.errorBoundary;
        this.eventManager = deps.eventManager;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Adds an event listener for external integration hooks
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {Object} Chain target for method chaining
     *
     * @example
     * events.on('emotionChanged', ({ emotion }) => {
     *   console.log('New emotion:', emotion);
     * });
     */
    on(event, callback) {
        return this.errorBoundary.wrap(
            () => {
                this.eventManager.on(event, callback);
                return this._chainTarget;
            },
            'event-listener-add',
            this._chainTarget
        )();
    }

    /**
     * Removes an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function to remove
     * @returns {Object} Chain target for method chaining
     */
    off(event, callback) {
        return this.errorBoundary.wrap(
            () => {
                this.eventManager.off(event, callback);
                return this._chainTarget;
            },
            'event-listener-remove',
            this._chainTarget
        )();
    }

    /**
     * Adds a one-time event listener that removes itself after first execution
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {Object} Chain target for method chaining
     */
    once(event, callback) {
        return this.errorBoundary.wrap(
            () => {
                this.eventManager.once(event, callback);
                return this._chainTarget;
            },
            'event-listener-once',
            this._chainTarget
        )();
    }

    /**
     * Removes all listeners for a specific event or all events
     * @param {string|null} event - Event name to clear, or null to clear all
     * @returns {Object} Chain target for method chaining
     */
    removeAllListeners(event = null) {
        return this.errorBoundary.wrap(
            () => {
                this.eventManager.removeAllListeners(event);
                return this._chainTarget;
            },
            'event-listeners-clear',
            this._chainTarget
        )();
    }

    /**
     * Gets the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.eventManager.listenerCount(event);
    }

    /**
     * Gets all registered event names
     * @returns {Array<string>} Array of event names
     */
    getEventNames() {
        return this.eventManager.getEventNames();
    }

    /**
     * Gets comprehensive event system statistics
     * @returns {Object} Event system statistics and monitoring data
     */
    getEventStats() {
        return this.eventManager.getEventStats();
    }

    /**
     * Gets EventManager debugging information
     * @returns {Object} Debug information about the event system
     */
    getEventDebugInfo() {
        return this.eventManager.getDebugInfo();
    }

    /**
     * Emits an event to all registered listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = null) {
        this.eventManager.emit(event, data);
    }
}
