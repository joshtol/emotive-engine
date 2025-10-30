/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *          ◐ ◑ ◒ ◓  PERFORMANCE BEHAVIOR MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview PerformanceBehaviorManager - Semantic Performance Execution
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module PerformanceBehaviorManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages semantic performances - choreographed sequences of emotions, gestures,
 * ║ and behaviors that express complex states like "celebrating", "empathizing",
 * ║ "thinking", etc. Coordinates with ContextManager for context-aware intensity.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🎭 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Execute semantic performances with context-aware intensity
 * │ • Register custom performances
 * │ • List available performances
 * │ • Provide performance analytics
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class PerformanceBehaviorManager {
    /**
     * Create PerformanceBehaviorManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Execute a semantic performance (e.g., 'celebrating', 'empathizing', 'success_major')
     * @param {string} semanticAction - The semantic action to perform
     * @param {Object} options - Performance options
     * @param {Object} [options.context] - Context for intensity calculation
     * @param {number} [options.context.frustration] - User frustration level (0-100)
     * @param {string} [options.context.urgency] - Urgency level (low/medium/high)
     * @param {string} [options.context.magnitude] - Magnitude (small/moderate/major/epic)
     * @param {number} [options.intensity] - Override calculated intensity (0-1)
     * @param {number} [options.delay] - Override default delay
     * @returns {Promise<EmotiveMascot>} Promise resolving to parent mascot instance
     *
     * @example
     * await mascot.perform('celebrating', {
     *   context: { magnitude: 'major', urgency: 'high' }
     * });
     *
     * @example
     * await mascot.perform('empathizing', {
     *   context: { frustration: 70 },
     *   intensity: 0.8
     * });
     */
    perform(semanticAction, options = {}) {
        return this.mascot.errorBoundary.wrap(async () => {
            if (!this.mascot.performanceSystem) {
                console.warn('[EmotiveMascot] PerformanceSystem not initialized');
                return this.mascot;
            }

            // Update context if provided
            if (options.context) {
                this.mascot.frustrationContextManager.updateContext(options.context);
            }

            // Execute the performance
            await this.mascot.performanceSystem.perform(semanticAction, {
                ...options,
                mascot: this.mascot
            });

            return this.mascot;
        }, 'semantic-performance', this.mascot)();
    }

    /**
     * Register a custom performance
     * @param {string} name - Performance name
     * @param {Object} definition - Performance definition
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.registerPerformance('custom_success', {
     *   steps: [
     *     { emotion: 'joy', duration: 500 },
     *     { gesture: 'bounce', duration: 300 },
     *     { emotion: 'pride', duration: 700 }
     *   ]
     * });
     */
    registerPerformance(name, definition) {
        return this.mascot.errorBoundary.wrap(() => {
            if (!this.mascot.performanceSystem) {
                console.warn('[EmotiveMascot] PerformanceSystem not initialized');
                return this.mascot;
            }

            this.mascot.performanceSystem.registerPerformance(name, definition);
            return this.mascot;
        }, 'performance-register', this.mascot)();
    }

    /**
     * Get all available performance names
     * @returns {Array<string>} Array of performance names
     *
     * @example
     * const performances = mascot.getAvailablePerformances();
     * console.log('Available performances:', performances);
     * // ['celebrating', 'empathizing', 'thinking', 'success_major', ...]
     */
    getAvailablePerformances() {
        return this.mascot.emotionalStateQueryManager.getAvailablePerformances();
    }

    /**
     * Get performance analytics (if enabled)
     * @returns {Object|null} Performance analytics data
     *
     * @example
     * const analytics = mascot.getPerformanceAnalytics();
     * console.log('Most used performance:', analytics.mostUsed);
     * console.log('Average duration:', analytics.averageDuration);
     */
    getPerformanceAnalytics() {
        return this.mascot.diagnosticsManager.getPerformanceAnalytics();
    }

    /**
     * Get context analytics (if history is enabled)
     * @returns {Object|null} Context analytics data
     *
     * @example
     * const analytics = mascot.getContextAnalytics();
     * console.log('Average frustration:', analytics.averageFrustration);
     * console.log('Peak urgency:', analytics.peakUrgency);
     */
    getContextAnalytics() {
        return this.mascot.emotionalStateQueryManager.getContextAnalytics();
    }
}
