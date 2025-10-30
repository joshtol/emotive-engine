/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *            ◐ ◑ ◒ ◓  ELEMENT ATTACHMENT MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview ElementAttachmentManager - DOM Element Tracking and Attachment
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module ElementAttachmentManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages mascot attachment to DOM elements with automatic position tracking on
 * ║ scroll/resize. Handles element positioning, containment, scaling, and cleanup.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 📍 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Attach mascot to DOM elements with positioning options
 * │ • Track element position on scroll and resize
 * │ • Manage element containment bounds and scaling
 * │ • Detach from elements and cleanup event listeners
 * │ • Calculate viewport-relative positioning
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class ElementAttachmentManager {
    /**
     * Create ElementAttachmentManager
     * @param {Function} getEngine - Function that returns the real engine instance
     * @param {Function} getCanvas - Function that returns the canvas element
     * @param {Object} mascotPublic - EmotiveMascotPublic instance for method calls
     */
    constructor(getEngine, getCanvas, mascotPublic) {
        this._getEngine = getEngine;
        this._getCanvas = getCanvas;
        this._mascot = mascotPublic;
        this._attachedElement = null;
        this._attachOptions = null;
        this._hasAttachedBefore = false;
        this._elementTrackingHandlers = null;
    }

    /**
     * Attach mascot to a DOM element with automatic position tracking
     * @param {HTMLElement|string} elementOrSelector - Element or CSS selector
     * @param {Object} options - Attachment options
     * @param {number} options.offsetX - X offset from element center (default: 0)
     * @param {number} options.offsetY - Y offset from element center (default: 0)
     * @param {boolean} options.animate - Animate to position (default: true)
     * @param {number} options.duration - Animation duration in ms (default: 1000)
     * @param {number} options.scale - Scale factor for mascot (default: 1, e.g., 0.5 = half size)
     * @param {boolean} options.containParticles - Whether to contain particles within element bounds (default: true)
     * @returns {EmotiveMascotPublic} Mascot instance for chaining
     *
     * @example
     * // Attach to element with default options
     * mascot.attachToElement('#myElement');
     *
     * @example
     * // Attach with custom positioning and scale
     * mascot.attachToElement(document.getElementById('logo'), {
     *   offsetX: 20,
     *   offsetY: -10,
     *   scale: 0.5,
     *   animate: true,
     *   duration: 1500
     * });
     *
     * @example
     * // Attach without particle containment
     * mascot.attachToElement('.hero-section', {
     *   containParticles: false,
     *   scale: 1.2
     * });
     */
    attachToElement(elementOrSelector, options = {}) {
        const engine = this._getEngine();
        if (!engine) {
            console.error('[EmotiveMascot] Engine not initialized');
            throw new Error('Engine not initialized. Call init() first.');
        }

        // Get the target element
        const element = typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;

        if (!element) {
            console.error(`[EmotiveMascot] Element not found: ${elementOrSelector}`);
            return this._mascot;
        }

        // Store element tracking info
        this._attachedElement = element;
        this._attachOptions = {
            offsetX: options.offsetX || 0,
            offsetY: options.offsetY || 0,
            animate: options.animate !== false,
            duration: options.duration || 1000,
            scale: options.scale || 1,
            containParticles: options.containParticles !== false
        };

        // Set containment bounds and scale if requested
        const rect = element.getBoundingClientRect();
        if (this._attachOptions.containParticles) {
            this._mascot.setContainment({ width: rect.width, height: rect.height }, this._attachOptions.scale);
        } else if (this._attachOptions.scale !== 1) {
            this._mascot.setContainment(null, this._attachOptions.scale);
        }

        // Position mascot at element
        const canvas = this._getCanvas();
        if (canvas) {
            this._updatePosition();
        }

        // Set up automatic tracking on scroll and resize
        this._setupEventListeners();

        return this._mascot;
    }

    /**
     * Update mascot position to match attached element
     * @private
     */
    _updatePosition() {
        if (!this._attachedElement) return;

        const canvas = this._getCanvas();
        if (!canvas) return;

        const rect = this._attachedElement.getBoundingClientRect();

        // Get viewport center
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        // Get element center in viewport coordinates
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        // Calculate offset from viewport center (what setPosition expects)
        const offsetX = elementCenterX - viewportCenterX + this._attachOptions.offsetX;
        const offsetY = elementCenterY - viewportCenterY + this._attachOptions.offsetY;

        // Use animation on first attach, instant updates on scroll/resize
        const isFirstAttach = !this._hasAttachedBefore;
        this._hasAttachedBefore = true;

        if (isFirstAttach && this._attachOptions.animate) {
            this._mascot.animateToPosition(offsetX, offsetY, 0, this._attachOptions.duration);
        } else {
            this._mascot.setPosition(offsetX, offsetY, 0);
        }
    }

    /**
     * Set up scroll and resize event listeners
     * @private
     */
    _setupEventListeners() {
        if (this._elementTrackingHandlers) return; // Already set up

        this._elementTrackingHandlers = {
            scroll: () => this._updatePosition(),
            resize: () => this._updatePosition()
        };

        window.addEventListener('scroll', this._elementTrackingHandlers.scroll, { passive: true });
        window.addEventListener('resize', this._elementTrackingHandlers.resize);
    }

    /**
     * Check if mascot is attached to an element
     * @returns {boolean} True if attached to an element
     *
     * @example
     * if (mascot.isAttachedToElement()) {
     *   console.log('Mascot is tracking an element');
     * }
     */
    isAttachedToElement() {
        return !!this._attachedElement;
    }

    /**
     * Detach mascot from tracked element and cleanup
     * @returns {EmotiveMascotPublic} Mascot instance for chaining
     *
     * @example
     * mascot.detachFromElement();
     */
    detachFromElement() {
        this._attachedElement = null;

        // Remove event listeners
        if (this._elementTrackingHandlers) {
            window.removeEventListener('scroll', this._elementTrackingHandlers.scroll);
            window.removeEventListener('resize', this._elementTrackingHandlers.resize);
            this._elementTrackingHandlers = null;
        }

        // Clear containment and reset scale
        this._mascot.setContainment(null, 1);

        // Reset to neutral state
        this._mascot.setEmotion('neutral');
        this._mascot.morphTo('sphere', { duration: 800 });

        return this._mascot;
    }

    /**
     * Cleanup on destroy
     * @internal
     */
    cleanup() {
        if (this._elementTrackingHandlers) {
            window.removeEventListener('scroll', this._elementTrackingHandlers.scroll);
            window.removeEventListener('resize', this._elementTrackingHandlers.resize);
            this._elementTrackingHandlers = null;
        }
        this._attachedElement = null;
    }
}
