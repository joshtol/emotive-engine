/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE - Element Targeting with Callbacks
 *  └─○═╝
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview Element targeting with callback functionality for mascot positioning
 * @author Emotive Engine Team
 * @module positioning/elementTargeting/ElementTargetingCallbacks
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides callback-based element targeting methods. Allows mascot to move to
 * ║ elements and execute callbacks when reaching them. Supports sequences, delays,
 * ║ conditions, and proximity-based triggers.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 */

import ElementTargeting from './ElementTargeting.js';

class ElementTargetingCallbacks extends ElementTargeting {
    constructor(positionController) {
        super(positionController);
        this.activeCallbacks = new Map();
        this.callbackStates = new Map();
    }

    /**
     * Move mascot to element and execute callback when reached
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} callback - Callback to execute when mascot reaches element
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     * @param {Object} options - Additional options
     */
    moveToElementWithCallback(
        targetSelector,
        callback,
        position = 'right',
        offset = { x: 20, y: 0 },
        options = {}
    ) {
        const callbackId = `callback-${Date.now()}-${Math.random()}`;

        const element = document.querySelector(targetSelector);
        if (!element) {
            console.warn(`Element not found: ${targetSelector}`);
            return;
        }

        // Store callback state
        this.callbackStates.set(callbackId, {
            executed: false,
            element,
            callback,
            options,
        });

        // Move to element
        this.moveToElement(targetSelector, position, offset, options);

        // Check if mascot has reached the element
        const checkProximity = () => {
            if (this.isMascotNearElement(element, options.proximity || 50)) {
                const state = this.callbackStates.get(callbackId);
                if (state && !state.executed) {
                    state.executed = true;
                    callback();

                    // Clean up if not repeating
                    if (!options.repeat) {
                        this.callbackStates.delete(callbackId);
                    }
                }
            }

            if (this.callbackStates.has(callbackId)) {
                requestAnimationFrame(checkProximity);
            }
        };

        this.activeCallbacks.set(callbackId, checkProximity);
        checkProximity();

        return () => {
            this.activeCallbacks.delete(callbackId);
            this.callbackStates.delete(callbackId);
        };
    }

    /**
     * Move mascot through a sequence of elements with callbacks
     * @param {Array} sequence - Array of {selector, callback, position, offset} objects
     * @param {Object} options - Sequence options
     */
    moveToElementSequence(sequence = [], options = {}) {
        let currentIndex = 0;
        const cleanupFunctions = [];

        const executeNext = () => {
            if (currentIndex >= sequence.length) {
                if (options.onComplete) options.onComplete();
                return;
            }

            const step = sequence[currentIndex];
            const cleanup = this.moveToElementWithCallback(
                step.selector,
                () => {
                    if (step.callback) step.callback();
                    currentIndex++;
                    setTimeout(executeNext, step.delay || 0);
                },
                step.position || 'right',
                step.offset || { x: 20, y: 0 },
                { ...options, ...step.options }
            );

            if (cleanup) cleanupFunctions.push(cleanup);
        };

        executeNext();

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }

    /**
     * Move mascot to element with delay before callback
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} callback - Callback to execute after delay
     * @param {number} delay - Delay in milliseconds
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithDelay(
        targetSelector,
        callback,
        delay = 1000,
        position = 'right',
        offset = { x: 20, y: 0 }
    ) {
        return this.moveToElementWithCallback(
            targetSelector,
            () => {
                setTimeout(callback, delay);
            },
            position,
            offset
        );
    }

    /**
     * Move mascot to element with conditional callback
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} condition - Condition function that returns boolean
     * @param {Function} callback - Callback to execute if condition is true
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithCondition(
        targetSelector,
        condition,
        callback,
        position = 'right',
        offset = { x: 20, y: 0 }
    ) {
        return this.moveToElementWithCallback(
            targetSelector,
            () => {
                if (condition()) {
                    callback();
                }
            },
            position,
            offset
        );
    }

    /**
     * Move mascot to element with repeating callback
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} callback - Callback to repeat while at element
     * @param {number} interval - Repeat interval in milliseconds
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithRepeat(
        targetSelector,
        callback,
        interval = 1000,
        position = 'right',
        offset = { x: 20, y: 0 }
    ) {
        return this.moveToElementWithCallback(
            targetSelector,
            () => {
                setInterval(callback, interval);
            },
            position,
            offset,
            { repeat: true }
        );
    }

    /**
     * Move mascot to element with proximity-based callback
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} callback - Callback to execute when within proximity
     * @param {number} proximity - Proximity threshold in pixels
     * @param {string} position - Position relative to element
     * @param {Object} offset - Pixel offset
     */
    moveToElementWithProximity(
        targetSelector,
        callback,
        proximity = 100,
        position = 'right',
        offset = { x: 20, y: 0 }
    ) {
        return this.moveToElementWithCallback(targetSelector, callback, position, offset, {
            proximity,
        });
    }

    /**
     * Check if mascot is near an element
     * @param {HTMLElement} element - Target element
     * @param {number} threshold - Distance threshold in pixels
     * @returns {boolean} True if mascot is within threshold
     */
    isMascotNearElement(element, threshold = 50) {
        if (!this.positionController || !element) return false;

        const elementRect = element.getBoundingClientRect();
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;

        const mascotOffset = this.positionController.getOffset();
        const mascotX = mascotOffset.x + window.innerWidth / 2;
        const mascotY = mascotOffset.y + window.innerHeight / 2;

        const distance = Math.sqrt(
            Math.pow(mascotX - elementCenterX, 2) + Math.pow(mascotY - elementCenterY, 2)
        );

        return distance <= threshold;
    }

    /**
     * Stop all active callbacks
     */
    stopAllCallbacks() {
        this.activeCallbacks.forEach((callback, id) => {
            this.activeCallbacks.delete(id);
        });
        this.callbackStates.clear();
    }

    /**
     * Destroy the callback system
     */
    destroy() {
        this.stopAllCallbacks();
        super.destroy();
    }
}

export default ElementTargetingCallbacks;
