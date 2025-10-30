/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *           ◐ ◑ ◒ ◓  FRUSTRATION CONTEXT MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview FrustrationContextManager - User Emotional Context Management
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module FrustrationContextManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages user emotional context including frustration levels, urgency, and
 * ║ magnitude. Provides mutation methods for context updates while queries are
 * ║ handled by EmotionalStateQueryManager.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Update general context (frustration, urgency, magnitude, custom values)
 * │ • Increment user frustration level
 * │ • Decrement user frustration level
 * │ • Reset frustration to zero
 * │ • Provide error boundary protection for all operations
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class FrustrationContextManager {
    /**
     * Create FrustrationContextManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Update conversation context (frustration, urgency, magnitude, etc.)
     * @param {Object} updates - Context updates
     * @param {number} [updates.frustrationLevel] - User frustration (0-100)
     * @param {number} [updates.urgency] - Situation urgency (0-1)
     * @param {number} [updates.magnitude] - Importance/impact (0-1)
     * @param {Object} [updates.custom] - Custom context values
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.updateContext({
     *   frustrationLevel: 30,
     *   urgency: 0.7,
     *   magnitude: 0.5
     * });
     */
    updateContext(updates) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this.mascot;
            }

            this.mascot.contextManager.update(updates);
            return this.mascot;
        }, 'context-update', this.mascot)();
    }

    /**
     * Increment user frustration level
     * @param {number} amount - Amount to increment (default: 10)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.incrementFrustration(15); // Add 15 to frustration
     */
    incrementFrustration(amount = 10) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this.mascot;
            }

            this.mascot.contextManager.incrementFrustration(amount);
            return this.mascot;
        }, 'frustration-increment', this.mascot)();
    }

    /**
     * Decrement user frustration level
     * @param {number} amount - Amount to decrement (default: 10)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.decrementFrustration(10); // Reduce frustration by 10
     */
    decrementFrustration(amount = 10) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this.mascot;
            }

            this.mascot.contextManager.decrementFrustration(amount);
            return this.mascot;
        }, 'frustration-decrement', this.mascot)();
    }

    /**
     * Reset user frustration to zero
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.resetFrustration(); // Clear all frustration
     */
    resetFrustration() {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.contextManager) {
                console.warn('[EmotiveMascot] ContextManager not initialized');
                return this.mascot;
            }

            this.mascot.contextManager.resetFrustration();
            return this.mascot;
        }, 'frustration-reset', this.mascot)();
    }
}
