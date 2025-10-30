/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *                 ◐ ◑ ◒ ◓  EVENT LISTENER MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview EventListenerManager - Event Subscription and Lifecycle Manager
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module EventListenerManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides public API for event subscription, unsubscription, and event system
 * ║ introspection. Wraps the internal EventManager with error boundaries and
 * ║ provides convenient lifecycle methods for external integration.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📡 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Subscribe to events with on() and once()
 * │ • Unsubscribe from events with off()
 * │ • Remove all listeners for specific events or all events
 * │ • Query listener counts and registered event names
 * │ • Provide event system statistics and debug information
 * │ • Emit events to registered listeners
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class EventListenerManager {
    /**
     * Create EventListenerManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Adds an event listener for external integration hooks
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.on('emotionChanged', ({ emotion }) => {
     *   console.log('New emotion:', emotion);
     * });
     */
    on(event, callback) {
        return this.mascot.errorBoundary.wrap(() => {
            const success = this.mascot.eventManager.on(event, callback);
            if (!success) {
                // Failed to add event listener
            }
            return this.mascot;
        }, 'event-listener-add', this.mascot)();
    }

    /**
     * Removes an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function to remove
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * const handler = ({ emotion }) => console.log(emotion);
     * mascot.on('emotionChanged', handler);
     * mascot.off('emotionChanged', handler);
     */
    off(event, callback) {
        return this.mascot.errorBoundary.wrap(() => {
            this.mascot.eventManager.off(event, callback);
            return this.mascot;
        }, 'event-listener-remove', this.mascot)();
    }

    /**
     * Adds a one-time event listener that removes itself after first execution
     * @param {string} event - Event name
     * @param {Function} callback - Event callback function
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.once('initialized', () => {
     *   console.log('Mascot ready!');
     * });
     */
    once(event, callback) {
        return this.mascot.errorBoundary.wrap(() => {
            const success = this.mascot.eventManager.once(event, callback);
            if (!success) {
                // Failed to add once event listener
            }
            return this.mascot;
        }, 'event-listener-once', this.mascot)();
    }

    /**
     * Removes all listeners for a specific event or all events
     * @param {string|null} event - Event name to clear, or null to clear all
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.removeAllListeners('emotionChanged'); // Clear specific event
     * mascot.removeAllListeners(); // Clear all events
     */
    removeAllListeners(event = null) {
        return this.mascot.errorBoundary.wrap(() => {
            const removedCount = this.mascot.eventManager.removeAllListeners(event);
            if (removedCount > 0) {
                // Cleared event listeners
            }
            return this.mascot;
        }, 'event-listeners-clear', this.mascot)();
    }

    /**
     * Gets the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     *
     * @example
     * const count = mascot.listenerCount('emotionChanged');
     * console.log(`${count} listeners registered`);
     */
    listenerCount(event) {
        return this.mascot.eventManager.listenerCount(event);
    }

    /**
     * Gets all registered event names
     * @returns {Array<string>} Array of event names
     *
     * @example
     * const events = mascot.getEventNames();
     * console.log('Registered events:', events);
     */
    getEventNames() {
        return this.mascot.eventManager.getEventNames();
    }

    /**
     * Gets comprehensive event system statistics
     * @returns {Object} Event system statistics and monitoring data
     *
     * @example
     * const stats = mascot.getEventStats();
     * console.log('Total events emitted:', stats.totalEventsEmitted);
     */
    getEventStats() {
        return this.mascot.eventManager.getEventStats();
    }

    /**
     * Gets EventManager debugging information
     * @returns {Object} Debug information about the event system
     *
     * @example
     * const debug = mascot.getEventDebugInfo();
     * console.log('Event system debug:', debug);
     */
    getEventDebugInfo() {
        return this.mascot.eventManager.getDebugInfo();
    }

    /**
     * Emits an event to all registered listeners with error boundary protection
     * @param {string} event - Event name
     * @param {*} data - Event data
     *
     * @example
     * mascot.emit('customEvent', { foo: 'bar' });
     */
    emit(event, data = null) {
        this.mascot.eventManager.emit(event, data);
    }
}
