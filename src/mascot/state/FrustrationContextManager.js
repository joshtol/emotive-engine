/**
 * FrustrationContextManager - User Emotional Context Management
 *
 * Manages user emotional context including frustration levels, urgency, and magnitude.
 *
 * @module FrustrationContextManager
 */

export class FrustrationContextManager {
    /**
     * Create FrustrationContextManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} deps.contextManager - Context manager instance
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('FrustrationContextManager: errorBoundary required');
        if (!deps.contextManager) throw new Error('FrustrationContextManager: contextManager required');

        this.errorBoundary = deps.errorBoundary;
        this.contextManager = deps.contextManager;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Update conversation context (frustration, urgency, magnitude, etc.)
     * @param {Object} updates - Context updates
     * @returns {Object} Chain target for method chaining
     */
    updateContext(updates) {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[FrustrationContextManager] ContextManager not initialized');
                return this._chainTarget;
            }
            this.contextManager.update(updates);
            return this._chainTarget;
        }, 'context-update', this._chainTarget)();
    }

    /**
     * Increment user frustration level
     * @param {number} amount - Amount to increment (default: 10)
     * @returns {Object} Chain target for method chaining
     */
    incrementFrustration(amount = 10) {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[FrustrationContextManager] ContextManager not initialized');
                return this._chainTarget;
            }
            this.contextManager.incrementFrustration(amount);
            return this._chainTarget;
        }, 'frustration-increment', this._chainTarget)();
    }

    /**
     * Decrement user frustration level
     * @param {number} amount - Amount to decrement (default: 10)
     * @returns {Object} Chain target for method chaining
     */
    decrementFrustration(amount = 10) {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[FrustrationContextManager] ContextManager not initialized');
                return this._chainTarget;
            }
            this.contextManager.decrementFrustration(amount);
            return this._chainTarget;
        }, 'frustration-decrement', this._chainTarget)();
    }

    /**
     * Reset user frustration to zero
     * @returns {Object} Chain target for method chaining
     */
    resetFrustration() {
        return this.errorBoundary.wrap(() => {
            if (!this.contextManager) {
                console.warn('[FrustrationContextManager] ContextManager not initialized');
                return this._chainTarget;
            }
            this.contextManager.resetFrustration();
            return this._chainTarget;
        }, 'frustration-reset', this._chainTarget)();
    }
}
