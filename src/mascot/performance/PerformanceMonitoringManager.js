/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *  ╔═○─┐ emotive
 *    ●●  ENGINE
 *  └─○═╝
 *          ◐ ◑ ◒ ◓  PERFORMANCE MONITORING MANAGER  ◓ ◒ ◑ ◐
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * @fileoverview PerformanceMonitoringManager - Performance Optimization and Monitoring
 * @author Emotive Engine Team
 * @version 1.0.0
 * @module PerformanceMonitoringManager
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════
 * ║                                   PURPOSE
 * ╠═══════════════════════════════════════════════════════════════════════════════════
 * ║ Manages performance monitoring, degradation control, and FPS targeting. Coordinates
 * ║ between diagnosticsManager, degradationManager, and animationFrameController to
 * ║ optimize mascot performance based on system capabilities.
 * ╚═══════════════════════════════════════════════════════════════════════════════════
 *
 * ┌───────────────────────────────────────────────────────────────────────────────────
 * │ ⚡ RESPONSIBILITIES
 * ├───────────────────────────────────────────────────────────────────────────────────
 * │ • Monitor and report degradation status
 * │ • Control degradation level (manual override)
 * │ • Check feature availability at current degradation level
 * │ • Manage target FPS for animation loops
 * │ • Enable/disable performance degradation mode
 * │ • Coordinate particle limits based on performance
 * └───────────────────────────────────────────────────────────────────────────────────
 *
 * ════════════════════════════════════════════════════════════════════════════════════
 */

import { browserCompatibility } from '../../utils/browserCompatibility.js';

export class PerformanceMonitoringManager {
    /**
     * Create PerformanceMonitoringManager
     * @param {EmotiveMascot} mascot - Parent mascot instance
     */
    constructor(mascot) {
        this.mascot = mascot;
    }

    /**
     * Get current degradation status
     * @returns {Object} Degradation status including level, active features, and metrics
     *
     * @example
     * const status = mascot.getDegradationStatus();
     * console.log('Level:', status.level);
     * console.log('Active features:', status.features);
     */
    getDegradationStatus() {
        return this.mascot.diagnosticsManager.getDegradationStatus();
    }

    /**
     * Manually set degradation level
     * @param {number|string} level - Degradation level index or name
     * @returns {boolean} True if level was set successfully
     *
     * @example
     * // Set to low degradation (level 1)
     * mascot.setDegradationLevel(1);
     *
     * @example
     * // Set to high degradation (level 3)
     * mascot.setDegradationLevel(3);
     */
    setDegradationLevel(level) {
        return this.mascot.diagnosticsManager.setDegradationLevel(level);
    }

    /**
     * Check if a specific feature is available in current degradation level
     * @param {string} feature - Feature name (audio, particles, fullEffects, etc.)
     * @returns {boolean} True if feature is available
     *
     * @example
     * if (mascot.isFeatureAvailable('particles')) {
     *   mascot.setEmotion('excited'); // Full particle effects
     * } else {
     *   mascot.setEmotion('calm'); // Reduced effects
     * }
     *
     * @example
     * // Check audio availability before enabling TTS
     * if (mascot.isFeatureAvailable('audio')) {
     *   mascot.speak('Hello!');
     * }
     */
    isFeatureAvailable(feature) {
        if (!this.mascot.degradationManager) {
            // Fallback to basic feature detection
            const features = browserCompatibility.featureDetection.getFeatures();
            return features[feature] || false;
        }

        return this.mascot.degradationManager.isFeatureAvailable(feature);
    }

    /**
     * Set target FPS for animation loop
     * @param {number} targetFPS - Target frames per second (30, 60, 120, etc.)
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @example
     * // Reduce FPS for power saving
     * mascot.setTargetFPS(30);
     *
     * @example
     * // High-refresh rate displays
     * mascot.setTargetFPS(120);
     *
     * @example
     * // Standard 60 FPS
     * mascot.setTargetFPS(60);
     */
    setTargetFPS(targetFPS) {
        return this.mascot.animationFrameController.setTargetFPS(targetFPS);
    }

    /**
     * Gets the current target FPS
     * @returns {number} Target frames per second
     *
     * @example
     * const currentFPS = mascot.getTargetFPS();
     * console.log(`Animation running at ${currentFPS} FPS target`);
     */
    getTargetFPS() {
        return this.mascot.animationFrameController.getTargetFPS();
    }

    /**
     * Enable or disable performance degradation mode
     * @param {boolean} enabled - Whether to enable degradation
     * @returns {EmotiveMascot} Parent mascot instance for chaining
     *
     * @note When enabled, reduces particle count to 50% of maximum
     * @note When disabled, restores particle count to configured maximum
     *
     * @example
     * // Enable degradation mode (reduce particles to 50%)
     * mascot.setPerformanceDegradation(true);
     *
     * @example
     * // Disable degradation mode (restore full particle count)
     * mascot.setPerformanceDegradation(false);
     *
     * @example
     * // Auto-detect low performance and degrade
     * setInterval(() => {
     *   const metrics = mascot.getPerformanceMetrics();
     *   if (metrics.fps < 30) {
     *     mascot.setPerformanceDegradation(true);
     *   } else if (metrics.fps > 55) {
     *     mascot.setPerformanceDegradation(false);
     *   }
     * }, 5000);
     */
    setPerformanceDegradation(enabled) {
        const metrics = this.mascot.animationController.getPerformanceMetrics();

        if (enabled && !metrics.performanceDegradation) {
            const currentMax = this.mascot.particleSystem.maxParticles;
            const newMax = Math.max(5, Math.floor(currentMax * 0.5));
            this.mascot.particleSystem.setMaxParticles(newMax);

            // Forced performance degradation
        } else if (!enabled && metrics.performanceDegradation) {
            this.mascot.particleSystem.setMaxParticles(this.mascot.config.maxParticles);

            // Disabled performance degradation
        }

        return this.mascot;
    }

    /**
     * Get current performance metrics
     * @returns {Object} Performance metrics including FPS, frame time, degradation status
     *
     * @example
     * const metrics = mascot.getPerformanceMetrics();
     * console.log('FPS:', metrics.fps);
     * console.log('Frame time:', metrics.frameTime);
     * console.log('Degradation:', metrics.performanceDegradation);
     */
    getPerformanceMetrics() {
        return this.mascot.healthCheckManager.getPerformanceMetrics();
    }
}
