/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *              ◐ ◑ ◒ ◓  HEALTH CHECK MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview HealthCheckManager - System Status and Health Monitoring
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module HealthCheckManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages system health monitoring, status reporting, and debug mode configuration.
 * ║ Provides comprehensive status checks for all subsystems including mobile
 * ║ optimization, accessibility, and performance metrics.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ 🏥 RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Report comprehensive system status
 * │ • Enable/disable debug mode
 * │ • Trigger test errors for error boundary testing
 * │ • Provide performance metrics
 * │ • Monitor mobile optimization status
 * │ • Track accessibility status
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

export class HealthCheckManager {
    /**
     * Create HealthCheckManager
     *
     * @param {Object} deps - Dependencies
     * @param {Object} deps.errorBoundary - Error handling wrapper
     * @param {Object} [deps.systemStatusReporter] - System status reporter instance
     * @param {Object} deps.diagnosticsManager - Diagnostics manager instance
     * @param {Object} deps.mobileOptimization - Mobile optimization instance
     * @param {Object} deps.accessibilityManager - Accessibility manager instance
     * @param {Object} deps.config - Configuration object
     * @param {Object} [deps.chainTarget] - Return value for method chaining
     */
    constructor(deps) {
        // Required dependency validation
        if (!deps.errorBoundary) throw new Error('HealthCheckManager: errorBoundary required');
        if (!deps.diagnosticsManager)
            throw new Error('HealthCheckManager: diagnosticsManager required');
        if (!deps.mobileOptimization)
            throw new Error('HealthCheckManager: mobileOptimization required');
        if (!deps.accessibilityManager)
            throw new Error('HealthCheckManager: accessibilityManager required');
        if (!deps.config) throw new Error('HealthCheckManager: config required');

        this.errorBoundary = deps.errorBoundary;
        this.systemStatusReporter = deps.systemStatusReporter || null;
        this.diagnosticsManager = deps.diagnosticsManager;
        this.mobileOptimization = deps.mobileOptimization;
        this.accessibilityManager = deps.accessibilityManager;
        this.config = deps.config;
        this._chainTarget = deps.chainTarget || this;
    }

    /**
     * Gets comprehensive system status for debugging and monitoring
     * @returns {Object} Complete system status
     *
     * @example
     * const status = mascot.getSystemStatus();
     * console.log('Renderer:', status.renderer);
     * console.log('State:', status.state);
     * console.log('Performance:', status.performance);
     */
    getSystemStatus() {
        return this.systemStatusReporter ? this.systemStatusReporter.getSystemStatus() : {};
    }

    /**
     * Enables or disables debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.setDebugMode(true);  // Enable debug overlay
     * mascot.setDebugMode(false); // Disable debug overlay
     */
    setDebugMode(enabled) {
        this.config.showDebug = !!enabled;
        this.config.showFPS = !!enabled;

        if (enabled) {
            // Debug mode enabled - performance and state info will be displayed
        } else {
            // Debug mode disabled
        }

        return this._chainTarget;
    }

    /**
     * Triggers a manual error for testing error boundary
     * @param {string} context - Error context for testing
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * mascot.triggerTestError('button-click-test');
     * // This will trigger error boundary without crashing the app
     */
    triggerTestError(context = 'manual-test') {
        return this.errorBoundary.wrap(
            () => {
                throw new Error(`Test error triggered in context: ${context}`);
            },
            context,
            this._chainTarget
        )();
    }

    /**
     * Gets current performance metrics
     * @returns {Object} Performance data
     *
     * @example
     * const metrics = mascot.getPerformanceMetrics();
     * console.log('FPS:', metrics.fps);
     * console.log('Frame time:', metrics.frameTime);
     */
    getPerformanceMetrics() {
        return this.diagnosticsManager.getPerformanceMetrics();
    }

    /**
     * Get mobile optimization status
     * @returns {Object} Mobile optimization status
     *
     * @example
     * const mobile = mascot.getMobileStatus();
     * console.log('Is mobile:', mobile.isMobile);
     * console.log('Touch enabled:', mobile.touchEnabled);
     */
    getMobileStatus() {
        return this.mobileOptimization.getStatus();
    }

    /**
     * Get accessibility status
     * @returns {Object} Accessibility status
     *
     * @example
     * const a11y = mascot.getAccessibilityStatus();
     * console.log('Reduced motion:', a11y.reducedMotion);
     * console.log('High contrast:', a11y.highContrast);
     */
    getAccessibilityStatus() {
        return this.accessibilityManager.getStatus();
    }
}
