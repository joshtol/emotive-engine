/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *             ◐ ◑ ◒ ◓  EMOTIONAL STATE QUERY MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview EmotionalStateQueryManager - Read-Only State and Capability Queries
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module EmotionalStateQueryManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Provides read-only query interface for emotional state, available capabilities,
 * ║ and context information. Separates data retrieval from state mutations
 * ║ (handled by StateCoordinator).
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🔍 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Query current emotional state and properties
 * │ • Retrieve available emotions, undertones, gestures, shapes
 * │ • Access context and context analytics
 * │ • List available performances
 * │ • Get emotional color representation
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import ShapeMorpher from '../../core/ShapeMorpher.js';

export class EmotionalStateQueryManager {
    /**
     * Create EmotionalStateQueryManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Gets the current emotional color
     * @returns {string} Hex color for current emotion
     *
     * @example
     * const color = mascot.getEmotionalColor();
     * console.log('Current color:', color); // '#FF5733'
     */
    getEmotionalColor() {
        const properties = this.mascot.stateMachine.getCurrentEmotionalProperties();
        // Fallback to neutral gray if properties are undefined
        return properties?.primaryColor || '#B0B0B0';
    }

    /**
     * Gets the current emotional state information
     * @returns {Object} Current state with properties
     *
     * @example
     * const state = mascot.getCurrentState();
     * console.log('Emotion:', state.emotion);
     * console.log('Undertone:', state.undertone);
     */
    getCurrentState() {
        return this.mascot.stateMachine.getCurrentState();
    }

    /**
     * Gets all available emotions
     * @returns {Array<string>} Array of emotion names
     *
     * @example
     * const emotions = mascot.getAvailableEmotions();
     * console.log('Available:', emotions); // ['joy', 'sadness', 'anger', ...]
     */
    getAvailableEmotions() {
        return this.mascot.stateMachine.getAvailableEmotions();
    }

    /**
     * Gets all available undertones
     * @returns {Array<string>} Array of undertone names
     *
     * @example
     * const undertones = mascot.getAvailableUndertones();
     * console.log('Available:', undertones); // ['calm', 'energetic', ...]
     */
    getAvailableUndertones() {
        return this.mascot.stateMachine.getAvailableUndertones();
    }

    /**
     * Gets all available gestures
     * @returns {Array<string>} Array of gesture names
     *
     * @example
     * const gestures = mascot.getAvailableGestures();
     * console.log('Available:', gestures); // ['bounce', 'pulse', 'shake', ...]
     */
    getAvailableGestures() {
        return [
            'bounce', 'pulse', 'shake', 'spin', 'drift',
            'nod', 'tilt', 'expand', 'contract', 'flash',
            'stretch', 'glow', 'flicker', 'vibrate', 'wave',
            'morph', 'slowBlink', 'look', 'settle',
            'breathIn', 'breathOut', 'breathHold', 'breathHoldEmpty', 'jump'
        ];
    }

    /**
     * Get all available performance names
     * @returns {Array<string>} Array of performance names
     *
     * @example
     * const performances = mascot.getAvailablePerformances();
     * console.log('Available:', performances); // ['celebration', 'thinking', ...]
     */
    getAvailablePerformances() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.performanceSystem) {
                return [];
            }
            return this.mascot.performanceSystem.getAllPerformanceNames();
        }, 'available-performances', this.mascot)();
    }

    /**
     * Get available shapes for morphing
     * @returns {Array} List of available shape names
     *
     * @example
     * const shapes = mascot.getAvailableShapes();
     * console.log('Available shapes:', shapes); // ['circle', 'heart', 'star', ...]
     */
    getAvailableShapes() {
        return ShapeMorpher.getAvailableShapes();
    }

    /**
     * Get current context (frustration, urgency, etc.)
     * @returns {Object|null} Context data or null if not available
     *
     * @example
     * const context = mascot.getContext();
     * console.log('Frustration:', context.frustrationLevel);
     * console.log('Urgency:', context.urgency);
     */
    getContext() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.contextManager) {
                return null;
            }
            return this.mascot.contextManager.getContext();
        }, 'context-get', this.mascot)();
    }

    /**
     * Get context analytics (if history is enabled)
     * @returns {Object|null} Context analytics data
     *
     * @example
     * const analytics = mascot.getContextAnalytics();
     * console.log('Avg frustration:', analytics.averageFrustration);
     * console.log('Peak urgency:', analytics.peakUrgency);
     */
    getContextAnalytics() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.contextManager) {
                return null;
            }
            return this.mascot.contextManager.getAnalytics();
        }, 'context-analytics', this.mascot)();
    }
}
